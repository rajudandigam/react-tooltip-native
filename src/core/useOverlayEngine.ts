/**
 * Central overlay orchestration: state machine, strategy resolution, adapter lifecycle.
 * Bridges interactionManager → state machine → native or fallback adapter.
 * No DOM logic except via adapters; no portals; no positioning math.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { OpenChangeReason, Placement } from "../types";
import { transition, type OverlayState, type StateEvent } from "./stateMachine";
import { createInteractionManager, type InteractionHandlers } from "./interactionManager";
import { detectSupports } from "../strategy/featureDetection";
import { resolveStrategy } from "../strategy/resolveStrategy";
import { createNativeAdapter, type NativeAdapter } from "../strategy/nativeAdapter";
import { createFallbackAdapter, type FallbackAdapter } from "../strategy/fallbackAdapter";

export type UseOverlayEngineOptions = {
  kind: "tooltip" | "popover";

  mode?: "auto" | "manual";
  placement: Placement;
  offset: number;

  strategy?: "auto" | "native" | "fallback";
  disableAnchorPositioning?: boolean;

  controlledOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void;

  interactionConfig: {
    openDelayMs: number;
    closeDelayMs: number;
    hoverableContent: boolean;
    dismissOnEsc: boolean;
  };

  closeOnOutsidePress?: boolean;
  closeOnEsc?: boolean;
  restoreFocusOnClose?: boolean;
};

export type UseOverlayEngineReturn = {
  open: boolean;
  setOpen: (next: boolean, reason?: OpenChangeReason) => void;

  triggerRef: (node: HTMLElement | null) => void;
  overlayRef: (node: HTMLElement | null) => void;

  supports: {
    popover: boolean;
    anchorPositioning: boolean;
  };
};

type AdapterInstance = NativeAdapter | FallbackAdapter;

function toOpenChangeReason(reason: "outside-press" | "escape"): OpenChangeReason {
  return reason === "outside-press" ? "outside-press" : "escape";
}

export function useOverlayEngine(options: UseOverlayEngineOptions): UseOverlayEngineReturn {
  const {
    kind,
    mode = "auto",
    placement,
    offset,
    strategy: strategyProp = "auto",
    disableAnchorPositioning,
    controlledOpen,
    defaultOpen = false,
    onOpenChange,
    interactionConfig,
    closeOnOutsidePress: closeOnOutsidePressProp,
    closeOnEsc: closeOnEscProp,
    restoreFocusOnClose,
  } = options;

  const idRaw = useId();
  const id = idRaw.replace(/:/g, "-");

  const [state, setState] = useState<OverlayState>("closed");
  const stateRef = useRef<OverlayState>(state);
  stateRef.current = state;

  const lastOpenReasonRef = useRef<OpenChangeReason>("programmatic");
  const lastCloseReasonRef = useRef<OpenChangeReason>("programmatic");

  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);
  const adapterRef = useRef<AdapterInstance | null>(null);
  const interactionRef = useRef<InteractionHandlers | null>(null);
  const pendingActionRef = useRef<"open" | "close" | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const isControlledRef = useRef(false);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const isControlled = controlledOpen !== undefined;
  isControlledRef.current = isControlled;

  const supports = useMemo(() => detectSupports(), []);

  const derivedOpen = isControlled ? controlledOpen : state === "open" || state === "opening";

  const dispatch = useCallback((event: StateEvent) => {
    const prev = stateRef.current;
    const result = transition(prev, event);
    if (result.shouldOpen) pendingActionRef.current = "open";
    if (result.shouldClose) pendingActionRef.current = "close";
    setState(result.state);
  }, []);

  useEffect(() => {
    const action = pendingActionRef.current;
    if (action === null) return;
    pendingActionRef.current = null;
    if (action === "open") adapterRef.current?.open();
    if (action === "close") adapterRef.current?.close();
  }, [state]);

  const setOpen = useCallback(
    (next: boolean, reason: OpenChangeReason = "programmatic") => {
      if (isControlled) {
        onOpenChange?.(next, reason);
        return;
      }

      if (next) {
        lastOpenReasonRef.current = reason;
        dispatch({ type: "REQUEST_OPEN", reason });
      } else {
        lastCloseReasonRef.current = reason;
        dispatch({ type: "REQUEST_CLOSE", reason });
      }
    },
    [isControlled, onOpenChange, dispatch]
  );

  useEffect(() => {
    if (!isControlled) return;
    if (!triggerEl || !overlayEl) return;

    const openDesired = controlledOpen === true;

    if (openDesired && (state === "closed" || state === "closing")) {
      lastOpenReasonRef.current = "programmatic";
      dispatch({ type: "REQUEST_OPEN", reason: "programmatic" });
    } else if (!openDesired && (state === "open" || state === "opening")) {
      lastCloseReasonRef.current = "programmatic";
      dispatch({ type: "REQUEST_CLOSE", reason: "programmatic" });
    }
  }, [isControlled, controlledOpen, state, triggerEl, overlayEl, dispatch]);

  useEffect(() => {
    if (!triggerEl || !overlayEl) {
      if (adapterRef.current) {
        adapterRef.current.destroy();
        adapterRef.current = null;
      }
      return;
    }

    const effectiveStrategy =
      disableAnchorPositioning === true ? "fallback" : strategyProp;
    const resolved = resolveStrategy({ strategy: effectiveStrategy, supports });

    const onAfterOpen = () => {
      dispatch({ type: "OPENED" });
      if (!isControlledRef.current) {
        onOpenChangeRef.current?.(true, lastOpenReasonRef.current);
      }
    };

    const onAfterClose = () => {
      dispatch({ type: "CLOSED" });
      if (!isControlledRef.current) {
        onOpenChangeRef.current?.(false, lastCloseReasonRef.current);
      }
    };

    if (resolved === "native") {
      adapterRef.current = createNativeAdapter({
        triggerEl,
        overlayEl,
        id,
        mode,
        placement,
        offset,
        onAfterOpen,
        onAfterClose,
      });
    } else {
      const closeOnOutsidePress =
        closeOnOutsidePressProp ?? mode === "auto";
      const closeOnEsc = closeOnEscProp ?? interactionConfig.dismissOnEsc;

      adapterRef.current = createFallbackAdapter({
        triggerEl,
        overlayEl,
        id,
        placement,
        offset,
        closeOnOutsidePress,
        closeOnEsc,
        restoreFocusOnClose,
        onRequestClose: (reason) => {
          const r = toOpenChangeReason(reason);
          lastCloseReasonRef.current = r;
          dispatch({ type: "REQUEST_CLOSE", reason: r });
        },
        onAfterOpen,
        onAfterClose,
      });
    }

    return () => {
      adapterRef.current?.destroy();
      adapterRef.current = null;
    };
  }, [
    triggerEl,
    overlayEl,
    id,
    mode,
    offset,
    strategyProp,
    disableAnchorPositioning,
    closeOnOutsidePressProp,
    closeOnEscProp,
    restoreFocusOnClose,
    interactionConfig.dismissOnEsc,
    dispatch,
  ]);

  useEffect(() => {
    if (!triggerEl) return;

    interactionRef.current = createInteractionManager({
      config: {
        kind,
        openDelayMs: interactionConfig.openDelayMs,
        closeDelayMs: interactionConfig.closeDelayMs,
        hoverableContent: interactionConfig.hoverableContent,
        dismissOnEsc: interactionConfig.dismissOnEsc,
      },
      onRequest: (req) => {
        if (req.type === "OPEN_REQUEST") {
          lastOpenReasonRef.current = req.reason;
          dispatch({ type: "REQUEST_OPEN", reason: req.reason });
        } else if (req.type === "CLOSE_REQUEST") {
          lastCloseReasonRef.current = req.reason;
          dispatch({ type: "REQUEST_CLOSE", reason: req.reason });
        } else {
          const open = stateRef.current === "open" || stateRef.current === "opening";
          if (open) {
            lastCloseReasonRef.current = req.reason;
            dispatch({ type: "REQUEST_CLOSE", reason: req.reason });
          } else {
            lastOpenReasonRef.current = req.reason;
            dispatch({ type: "REQUEST_OPEN", reason: req.reason });
          }
        }
      },
    });

    return () => {
      interactionRef.current?.destroy();
      interactionRef.current = null;
    };
  }, [triggerEl, kind, interactionConfig, dispatch]);

  useEffect(() => {
    const adapter = adapterRef.current;
    if (adapter) adapter.updatePlacement(placement);
  }, [placement]);

  const triggerRef = useCallback((node: HTMLElement | null) => {
    setTriggerEl(node);
  }, []);

  const overlayRef = useCallback((node: HTMLElement | null) => {
    setOverlayEl(node);
  }, []);

  return {
    open: derivedOpen,
    setOpen,
    triggerRef,
    overlayRef,
    supports,
  };
}

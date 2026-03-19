import { HomeAssistant } from "../lib/types";
import { Action, CardConfig, CustomConfig } from "../types";
import { actionItem, computeActionsForDomain } from "./actions/compute_actions_for_domain";

export function resolveDefaultEntity(
  cardConfig: CardConfig,
): string | undefined {
  const includeEntities = cardConfig?.include;

  if (!includeEntities || includeEntities.length === 0) return undefined;
  if (includeEntities.length === 1) return includeEntities[0];

  if (cardConfig.default_entity === undefined) return undefined;

  if (typeof cardConfig.default_entity === "number") {
    const idx = cardConfig.default_entity;
    if (idx >= 0 && idx < includeEntities.length) return includeEntities[idx];
    return undefined;
  }

  return cardConfig.default_entity;
}

function getDefaultAction(
  actions: actionItem[],
  actionSpec: string | number | undefined
): Action | undefined {
  if (actionSpec === undefined || actions.length === 0) return undefined;

  if (typeof actionSpec === 'number') {
    if (actionSpec >= 0 && actionSpec < actions.length) {
      return actions[actionSpec].action;
    }
    return undefined;
  }

  if (typeof actionSpec === 'string') {
    const idx = actions.findIndex(
      (a) => a.name === actionSpec || a.key === actionSpec
    );
    return idx >= 0 ? actions[idx].action : undefined;
  }

  return undefined;
}

export function resolveDefaultActionsByDomain(
  hass: HomeAssistant,
  cardConfig: CardConfig
): Record<string, Action> {
  const result: Record<string, Action> = {};

  if (!cardConfig.default_actions) return result;

  for (const [domain, actionSpec] of Object.entries(cardConfig.default_actions)) {
    if (actionSpec === undefined || actionSpec === null) continue;
    const actions = computeActionsForDomain(hass, domain, cardConfig);
    const action = getDefaultAction(actions, actionSpec);
    if (action) {
      result[domain] = action;
    }
  }
  return result;
}


export function getDefaultActionForEntity(
  entityId: string,
  defaultActionsByDomain: Record<string, Action>
): Action | undefined {
  const domain = entityId.split(".")[0];
  return defaultActionsByDomain[domain];
}

export function entityHasDefaultAction(
  entityId: string,
  defaultActionsByDomain: Record<string, Action>
): boolean {
  return getDefaultActionForEntity(entityId, defaultActionsByDomain) !== undefined;
}
import type { AuditIntakeDraft } from './types';

const STORAGE_KEY = 'flowstack:audit-intake-draft';

export const createEmptyAuditDraft = (): AuditIntakeDraft => {
  const now = new Date().toISOString();

  return {
    focus: [],
    businessType: '',
    teamSizeRange: 'unknown',
    monthlyToolSpendRange: 'unknown',
    urgency: 'exploring',
    businessName: '',
    websiteUrl: '',
    currentPain: '',
    tools: [],
    projectSignals: [],
    desiredOutcome: '',
    contactEmail: '',
    consentToContact: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const loadAuditDraft = (): AuditIntakeDraft => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyAuditDraft();

    return { ...createEmptyAuditDraft(), ...JSON.parse(raw) };
  } catch {
    return createEmptyAuditDraft();
  }
};

export const saveAuditDraft = (draft: AuditIntakeDraft) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
  );
};

export const clearAuditDraft = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

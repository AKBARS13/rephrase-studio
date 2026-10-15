import type { RuleFinding, WritingStyle } from "../types.js";
import { findRegex, rhythmFindings } from "./common.js";

const THROAT_CLEARING = /\b(?:here's the thing|here's what (?:I|we) (?:mean|find interesting)|the uncomfortable truth is|it turns out|let me be clear|the truth is|I'm going to be honest|can we talk about)\b/giu;
const JARGON = /\b(?:navigate challenges|unpack|lean into|landscape|game-changer|double down|deep dive|take a step back|moving forward|circle back|on the same page)\b/giu;
const EMPHASIS = /\b(?:full stop|period|let that sink in|make no mistake|this matters because|I promise)\b/giu;
const BINARY = /\bnot\s+[^.!?]{1,80}[.!?]\s*(?:but\s+|because\s+)[^.!?]+|\b(?:isn't|is not)\s+[^,.!?]{1,60}[,.]\s*(?:it is|it's)\s+/giu;
const VAGUE = /\b(?:the implications are significant|the stakes are high|the consequences are real|the reasons are structural)\b/giu;
const EM_DASH = /—/gu;
const ADVERB = /\b[\p{L}]+ly\b/giu;
const PASSIVE = /\b(?:is|are|was|were|be|been|being)\s+[a-z]+(?:ed|en)\b/giu;
const STACCATO = /(?:^|(?<=[.!?]\s))(?:[A-Z][\p{L}-]{1,20}[.!?]\s*){3,}/gmu;

export const ENGLISH_RULE_SUMMARY = [
  "Remove throat-clearing, empty emphasis, business jargon, and formulaic contrasts.",
  "Prefer concrete claims and varied rhythm; avoid manufactured fragments and em dashes.",
  "Name the actor when useful, while retaining legitimate academic passive constructions.",
  "Preserve facts, negation, modality, causality, numbers, quotations, citations, and technical terms.",
  "Do not invent evidence, references, entities, or specificity.",
];

export function analyzeEnglish(text: string, style: WritingStyle): RuleFinding[] {
  const findings = [
    ...findRegex(text, "en.throat-clearing", THROAT_CLEARING, "State the claim without the announcement phrase.", "error"),
    ...findRegex(text, "en.business-jargon", JARGON, "Replace business jargon with a precise expression.", "error"),
    ...findRegex(text, "en.emphasis-crutch", EMPHASIS, "Remove performative emphasis that adds no evidence.", "error"),
    ...findRegex(text, "en.binary-contrast", BINARY, "Rewrite the formulaic contrast without deleting either proposition.", "error"),
    ...findRegex(text, "en.vague-declarative", VAGUE, "Name the specific implication, consequence, or reason."),
    ...findRegex(text, "en.em-dash", EM_DASH, "Stop Slop disallows em dashes.", "error"),
    ...findRegex(text, "en.staccato", STACCATO, "Connect repeated fragments into a grammatical sentence.", "error"),
    ...rhythmFindings(text, "en"),
  ];
  for (const finding of findRegex(text, "en.adverb", ADVERB, "Check whether this adverb carries necessary meaning.", "info")) findings.push(finding);
  if (!["academic", "lab-report", "technical-report"].includes(style)) findings.push(...findRegex(text, "en.passive", PASSIVE, "Name the actor if the passive construction hides one.", "info"));
  return findings;
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { JobPostFormValues } from "@/app/api/types/jobs.types";

const COOKIE_NAME = "job-templates";
const MAX_TEMPLATES = 5;

export interface JobTemplate {
	id: string;
	name: string;
	createdAt: string;
	data: Omit<JobPostFormValues, "startDate" | "endDate">;
}

// Cache for snapshots - must return same reference if data hasn't changed
let cachedTemplates: JobTemplate[] = [];
let cachedCookieString = "";

function getCookieValue(): JobTemplate[] {
	if (typeof document === "undefined") return cachedTemplates;

	// Get raw cookie string to compare
	const match = document.cookie.match(
		new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`),
	);
	const cookieString = match?.[2] ?? "";

	// Return cached value if cookie hasn't changed
	if (cookieString === cachedCookieString) {
		return cachedTemplates;
	}

	// Parse and cache new value
	cachedCookieString = cookieString;
	try {
		cachedTemplates = cookieString
			? JSON.parse(decodeURIComponent(cookieString))
			: [];
	} catch {
		cachedTemplates = [];
	}
	return cachedTemplates;
}

function setCookieValue(templates: JobTemplate[]) {
	const value = encodeURIComponent(JSON.stringify(templates));
	// Update cache immediately
	cachedTemplates = templates;
	cachedCookieString = value;
	// Set cookie to expire in 1 year
	const expires = new Date();
	expires.setFullYear(expires.getFullYear() + 1);
	// biome-ignore lint/suspicious/noDocumentCookie: surpress
	document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

// For useSyncExternalStore
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
	listeners = [...listeners, listener];
	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
}

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

// getSnapshot must return cached/immutable data
function getSnapshot(): JobTemplate[] {
	return getCookieValue();
}

// getServerSnapshot must return same reference every time
function getServerSnapshot(): JobTemplate[] {
	return cachedTemplates;
}

export function useJobTemplates() {
	const templates = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);

	const saveTemplate = useCallback(
		(name: string, data: JobPostFormValues): boolean => {
			const current = getCookieValue();

			if (current.length >= MAX_TEMPLATES) {
				return false;
			}

			// Exclude dates from template (they should be set fresh each time)
			const { startDate, endDate, ...templateData } = data;

			const newTemplate: JobTemplate = {
				id: crypto.randomUUID(),
				name: name.trim(),
				createdAt: new Date().toISOString(),
				data: templateData,
			};

			const updated = [newTemplate, ...current];
			setCookieValue(updated);
			emitChange();
			return true;
		},
		[],
	);

	const deleteTemplate = useCallback((id: string) => {
		const current = getCookieValue();
		const updated = current.filter((t) => t.id !== id);
		setCookieValue(updated);
		emitChange();
	}, []);

	const getTemplate = useCallback((id: string): JobTemplate | undefined => {
		return getCookieValue().find((t) => t.id === id);
	}, []);

	return {
		templates,
		saveTemplate,
		deleteTemplate,
		getTemplate,
		maxTemplates: MAX_TEMPLATES,
		canSaveMore: templates.length < MAX_TEMPLATES,
	};
}

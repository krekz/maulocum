"use client";

import { FileText, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { JobPostFormValues } from "@/app/api/types/jobs.types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type JobTemplate, useJobTemplates } from "@/lib/hooks/useJobTemplates";

interface JobTemplateManagerProps {
	form: UseFormReturn<JobPostFormValues>;
}

export function JobTemplateManager({ form }: JobTemplateManagerProps) {
	const { templates, saveTemplate, deleteTemplate, canSaveMore } =
		useJobTemplates();
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<JobTemplate | null>(
		null,
	);
	const [templateName, setTemplateName] = useState("");

	const handleSaveTemplate = () => {
		if (!templateName.trim()) {
			toast.error("Please enter a template name");
			return;
		}

		const formData = form.getValues();
		const success = saveTemplate(templateName, formData);

		if (success) {
			toast.success("Template saved successfully");
			setShowSaveDialog(false);
			setTemplateName("");
		} else {
			toast.error(
				`Maximum ${5} templates allowed. Delete one to save a new template.`,
			);
		}
	};

	const handleLoadTemplate = (template: JobTemplate) => {
		// Reset form with template data, keeping dates undefined
		form.reset({
			...template.data,
			startDate: undefined,
			endDate: undefined,
		});
		toast.success(`Loaded template: ${template.name}`);
	};

	const handleDeleteTemplate = () => {
		if (templateToDelete) {
			deleteTemplate(templateToDelete.id);
			toast.success("Template deleted");
			setShowDeleteDialog(false);
			setTemplateToDelete(null);
		}
	};

	const confirmDelete = (template: JobTemplate) => {
		setTemplateToDelete(template);
		setShowDeleteDialog(true);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" className="gap-2">
						<FileText className="h-4 w-4" />
						Templates
						{templates.length > 0 && (
							<span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
								{templates.length}
							</span>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-64">
					<DropdownMenuLabel>Job Templates</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{templates.length === 0 ? (
						<div className="px-2 py-4 text-center text-sm text-muted-foreground">
							No saved templates yet
						</div>
					) : (
						templates.map((template) => (
							<DropdownMenuItem
								key={template.id}
								className="flex items-center justify-between gap-2 cursor-pointer"
								onSelect={(e) => e.preventDefault()}
							>
								<button
									type="button"
									className="flex-1 text-left truncate"
									onClick={() => handleLoadTemplate(template)}
								>
									<span className="font-medium">{template.name}</span>
									<span className="block text-xs text-muted-foreground">
										{formatDate(template.createdAt)}
									</span>
								</button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
									onClick={(e) => {
										e.stopPropagation();
										confirmDelete(template);
									}}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuItem>
						))
					)}

					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() => setShowSaveDialog(true)}
						disabled={!canSaveMore}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Save Current as Template
						{!canSaveMore && (
							<span className="text-xs text-muted-foreground">(max 5)</span>
						)}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Save Template Dialog */}
			<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save as Template</DialogTitle>
						<DialogDescription>
							Save the current form values as a reusable template. Dates will
							not be saved and must be set each time.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="template-name">Template Name</Label>
							<Input
								id="template-name"
								placeholder="e.g., Weekend GP Locum"
								value={templateName}
								onChange={(e) => setTemplateName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSaveTemplate();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowSaveDialog(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveTemplate} className="gap-2">
							<Save className="h-4 w-4" />
							Save Template
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Template</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;{templateToDelete?.name}
							&quot;? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTemplate}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

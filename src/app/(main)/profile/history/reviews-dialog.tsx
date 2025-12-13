"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, StarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/rpc";

const reviewFormSchema = z.object({
	rating: z.number().min(1, "Please select a rating").max(5),
	comment: z
		.string()
		.max(1000, "Comment cannot exceed 1000 characters")
		.optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewsDialogProps {
	jobId: string;
	facilityName: string;
	trigger?: React.ReactNode;
}

function StarRating({
	rating,
	onRatingChange,
	readOnly = false,
}: {
	rating: number;
	onRatingChange?: (rating: number) => void;
	readOnly?: boolean;
}) {
	const [hoverRating, setHoverRating] = useState(0);

	const handleMouseEnter = (index: number) => {
		if (readOnly) return;
		setHoverRating(index);
	};

	const handleMouseLeave = () => {
		if (readOnly) return;
		setHoverRating(0);
	};

	const handleClick = (index: number) => {
		if (readOnly || !onRatingChange) return;
		onRatingChange(index);
	};

	const displayRating = hoverRating > 0 ? hoverRating : rating;

	return (
		<div className="flex gap-1">
			{[1, 2, 3, 4, 5].map((index) => (
				<StarIcon
					key={index}
					className={`h-6 w-6 cursor-${readOnly ? "default" : "pointer"} transition-colors ${
						index <= displayRating
							? "fill-yellow-400 text-yellow-400"
							: "fill-transparent text-gray-300"
					}`}
					onMouseEnter={() => handleMouseEnter(index)}
					onMouseLeave={handleMouseLeave}
					onClick={() => handleClick(index)}
				/>
			))}
		</div>
	);
}

function ReviewsDialog({ jobId, facilityName, trigger }: ReviewsDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<ReviewFormValues>({
		resolver: zodResolver(reviewFormSchema),
		defaultValues: {
			rating: 0,
			comment: "",
		},
	});

	const reviewMutation = useMutation({
		mutationFn: async (data: ReviewFormValues) => {
			const response = await client.api.v2.doctors.jobs[":jobId"].review.$post({
				param: { jobId },
				json: {
					rating: data.rating,
					comment: data.comment,
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to submit review");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Review submitted successfully");
			setOpen(false);
			form.reset();
			queryClient.invalidateQueries({ queryKey: ["doctor-applications"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit review");
		},
	});

	const handleRatingChange = (rating: number) => {
		form.setValue("rating", rating, { shouldValidate: true });
	};

	const onSubmit = (data: ReviewFormValues) => {
		reviewMutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button variant="outline">Leave a Review</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Review {facilityName}</DialogTitle>
					<DialogDescription>
						Share your experience with this facility to help others make
						informed decisions.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="rating"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Rating</FormLabel>
									<FormControl>
										<StarRating
											rating={field.value || 0}
											onRatingChange={handleRatingChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="comment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your Review</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Share your experience with this facility..."
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormDescription className="text-xs italic">
							Note: Your review will be posted anonymously. Only your rating and
							comments will be visible to others, not your name or personal
							information.
						</FormDescription>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={reviewMutation.isPending}>
								{reviewMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : (
									"Submit Review"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default ReviewsDialog;

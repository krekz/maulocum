"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const reviewFormSchema = z.object({
	rating: z.number().min(1, "Please select a rating").max(5),
	comment: z
		.string()
		.min(5, "Comment must be at least 5 characters")
		.max(500, "Comment cannot exceed 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewsDialogProps {
	facilityId: string;
	facilityName: string;
	onSubmitReview?: (data: ReviewFormValues) => void;
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

function ReviewsDialog({
	facilityId = "",
	facilityName = "Facility",
	onSubmitReview,
	trigger,
}: ReviewsDialogProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ReviewFormValues>({
		resolver: zodResolver(reviewFormSchema),
		defaultValues: {
			rating: 0,
			comment: "",
		},
	});

	const handleRatingChange = (rating: number) => {
		form.setValue("rating", rating, { shouldValidate: true });
	};

	const onSubmit = async (data: ReviewFormValues) => {
		setIsSubmitting(true);
		try {
			// Call the onSubmitReview callback if provided
			if (onSubmitReview) {
				onSubmitReview(data);
			}

			// Close the dialog and reset the form
			setOpen(false);
			form.reset();
		} catch (error) {
			console.error("Error submitting review:", error);
		} finally {
			setIsSubmitting(false);
		}
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
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Submit Review"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default ReviewsDialog;

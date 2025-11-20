import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { auth } from "@/lib/auth";

async function PostJobPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();
	if (!session.user.isEmployer) notFound();

	return (
		<div className="px-6 mx-auto w-full">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Post a Locum Job</h1>
				<p className="text-muted-foreground">
					Fill out the form below to post a new locum position at your facility
				</p>
			</div>

			<JobPostForm />
		</div>
	);
}

export default PostJobPage;

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { EditJobForm } from "@/components/employer/edit-job-form";
import { backendApi } from "@/lib/rpc";

async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const headersList = await headers();
	const cookie = headersList.get("cookie");
	const res = await backendApi.api.v2.facilities.jobs[":id"].$get(
		{
			param: {
				id,
			},
		},
		{
			headers: {
				cookie: cookie || "",
			},
		},
	);

	if (!res.ok) {
		notFound();
	}

	const { data: job } = await res.json();

	if (!job) {
		notFound();
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Edit Job</h1>
					<p className="text-muted-foreground mt-2">
						Update the details of your job posting
					</p>
				</div>

				<EditJobForm job={job} />
			</div>
		</div>
	);
}

export default EditJobPage;

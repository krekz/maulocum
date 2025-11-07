import { FacilityRegistrationForm } from "./facility-registration-form";

export default function EmployerRegistrationPage() {
	return (
		<div className="container max-w-3xl py-8">
			<div className="mb-8 space-y-2">
				<h1 className="text-3xl font-bold">Facility Verification</h1>
				<p className="text-muted-foreground">
					Complete your facility verification to start posting job opportunities
				</p>
			</div>

			<FacilityRegistrationForm />
		</div>
	);
}

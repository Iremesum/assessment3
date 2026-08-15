export default function About() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">About This Project</h2>

      <p className="mb-2">
        This project is Assessment 3 of a multi-stage assignment. It extends the
        RSS Server + LMS application from Assessment 2 with observability,
        testing, reporting, dashboard metrics, OpenTelemetry instrumentation,
        and cloud deployment.
      </p>

      <p className="mb-2">Name: Irem Ercan Sumer</p>
      <p className="mb-4">Student Number: 22591527</p>

      <h3 className="text-xl font-semibold mb-2">Demo Video</h3>

      <iframe
        className="w-full max-w-2xl aspect-video"
        src="/assets/22591527_Assessment3_Video.mp4"
        title="Assessment 3 demo video"
        allowFullScreen
      />
    </div>
  );
}
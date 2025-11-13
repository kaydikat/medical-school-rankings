// src/app/submit/success/page.tsx
export default function Success() {
  return (
    <div className="container py-5 text-center">
      <h1>Thank You!</h1>
      <p>Your rankings have been submitted and verified.</p>
      <a href="/calculate" className="btn btn-primary">Back to Calculator</a>
    </div>
  );
}
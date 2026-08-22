import { LegalLayout } from "./LegalLayout";

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" updated="Template — pending legal review">
      <p className="rounded-md bg-orange-light px-3 py-2 text-orange-dark">
        This is a starting template, not finished legal copy. Replace this
        page with language reviewed by your legal counsel before relying on
        it for a live business.
      </p>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Acceptance of Terms
        </h2>
        <p>
          By signing in to this system, you agree to use it only for
          authorized business purposes on behalf of the business that
          operates it.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Accounts &amp; Access
        </h2>
        <p>
          Accounts are created and managed by administrators. You are
          responsible for keeping your credentials confidential and for
          activity performed under your account.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Acceptable Use
        </h2>
        <p>
          The system may only be used to manage the business's products,
          inventory, and sales. Attempting to access data or accounts you are
          not authorized to view is prohibited.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Availability &amp; Changes
        </h2>
        <p>
          The system is provided as an internal business tool without
          guarantee of uninterrupted availability. Features may change as the
          system is developed further.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Limitation of Liability
        </h2>
        <p>
          The system is provided "as is" for internal use. The business
          operating it is responsible for decisions made using the data it
          contains.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Contact
        </h2>
        <p>Questions about these terms can be directed to the business owner or system administrator.</p>
      </section>
    </LegalLayout>
  );
}

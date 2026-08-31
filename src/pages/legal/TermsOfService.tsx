// pages/legal/TermsOfService.tsx
import { LegalLayout } from "./LegalLayout";

export function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="2026-08-24"
      description="Terms of Service for Hekima Veritas, covering account use, acceptable use, and access to the system."
    >
      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Acceptance of Terms
        </h2>
        <p>
          By signing in to this system, you agree to use it only for
          authorized business purposes on behalf of{" "}
          <strong className="font-medium text-text-primary">
            HEKIMA VERITAS & GENERAL SUPPLY COMPANY LIMITED
          </strong>{" "}
          ("the Business"), which operates it.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Accounts &amp; Access
        </h2>
        <p>
          Accounts are created and managed by administrators. You are
          responsible for keeping your credentials confidential and for
          activity performed under your account. Notify an administrator
          immediately if you believe your account has been accessed
          without authorization.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Acceptable Use
        </h2>
        <p>
          The system may only be used to manage the Business's products,
          inventory, and sales. Attempting to access data or accounts you
          are not authorized to view, circumventing role-based access
          controls, or using the system for any purpose unrelated to the
          Business's operations is prohibited.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Data Accuracy
        </h2>
        <p>
          Product, pricing, stock, and sales records are entered directly
          by staff. The Business relies on this information being accurate
          and entered in good faith, and is responsible for correcting
          errors it becomes aware of.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Suspension &amp; Termination
        </h2>
        <p>
          The Business may suspend or deactivate any account at its
          discretion, including on departure of a staff member or
          suspected misuse. Access ends immediately once an account is
          deactivated.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Availability &amp; Changes
        </h2>
        <p>
          The system is provided as an internal business tool without
          guarantee of uninterrupted availability. Features may change as
          the system is developed further.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Intellectual Property
        </h2>
        <p>
          [Ownership and licensing of the software to be stated here in
          line with the development agreement between the Business and
          Zentrya Limited.]
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Limitation of Liability
        </h2>
        <p>
          The system is provided "as is" for internal use. The Business
          operating it is responsible for decisions made using the data it
          contains.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Governing Law
        </h2>
        <p>
          These terms are governed by the laws of the United Republic of
          Tanzania.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Contact
        </h2>
        <p>
          Questions about these terms can be directed to{" "}
          <strong className="font-medium text-text-primary">
            HEKIMA VERITAS & GENERAL SUPPLY COMPANY LIMITED
          </strong>{" "}
          at{" "}
          <a
            href="tel:+255767178040"
            className="text-orange-dark underline-offset-2 hover:underline"
          >
            +255 767 178 040
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
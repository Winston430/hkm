import { LegalLayout } from "./LegalLayout";

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="Template — pending legal review">
      <p className="rounded-md bg-orange-light px-3 py-2 text-orange-dark">
        This is a starting template, not finished legal copy. Replace this
        page with language reviewed by your legal counsel before relying on
        it for a live business.
      </p>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Overview
        </h2>
        <p>
          This admin application is used internally to manage products,
          inventory, sales, and staff accounts for the business. This policy
          describes what information the system stores and how it is used.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Information We Collect
        </h2>
        <p>
          Account information for staff (name, email, role), business records
          such as products, categories, stock movements, and sales
          transactions, and basic activity metadata (timestamps of actions
          taken in the system).
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          How We Use Information
        </h2>
        <p>
          Information is used solely to operate the business: to authenticate
          staff, record and report on sales, track stock levels, and maintain
          an audit trail of inventory changes.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Data Retention &amp; Security
        </h2>
        <p>
          Data is stored in the business's Firebase project and protected by
          authentication and role-based access rules. Only active
          administrator and agent accounts can access the system, and
          write access to sensitive records is restricted to administrators.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Your Rights
        </h2>
        <p>
          Staff may request access to, correction of, or removal of their
          account information by contacting an administrator.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-[14px] font-semibold text-text-primary">
          Contact
        </h2>
        <p>Questions about this policy can be directed to the business owner or system administrator.</p>
      </section>
    </LegalLayout>
  );
}

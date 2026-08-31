// pages/legal/PrivacyPolicy.tsx
import { LegalLayout } from "./LegalLayout";

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="2026-08-24"
      description="Privacy Policy for Hekima Veritas, describing what account and business data the system collects and how it is used and protected."
    >
      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Overview
        </h2>
        <p>
          This Privacy Policy applies to the Hekima Veritas admin
          application (the "System"), an internal tool used by{" "}
          <strong className="font-medium text-text-primary">
            HEKIMA VERITAS & GENERAL SUPPLY COMPANY LIMITED
          </strong>{" "}
          ("the Business") to manage products, inventory, sales, and staff
          accounts. It describes what information the System stores, how it
          is used, and how it is protected. It applies to the Business's
          administrators and agents who sign in to the System — it does not
          apply to the Business's customers, whose purchases are recorded in
          the System by item and amount only, without collecting customer
          names, phone numbers, or other personal details.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Information We Collect
        </h2>
        <p>
          The System collects account information for each staff member,
          including name, email address, assigned role, and account status.
          It stores the business records staff enter in the course of their
          work — products, categories, pricing, stock levels, and sales
          transactions — and it keeps an activity log of key actions (such
          as stock adjustments, sales, and account changes) together with a
          timestamp and the staff member responsible, for accountability and
          audit purposes.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          How We Use Information
        </h2>
        <p>
          Information is used solely to operate the Business: to
          authenticate staff signing in, to record and report on sales and
          inventory, to maintain an audit trail of who made which changes,
          and to allow administrators to manage staff access. The System
          does not use staff or business data for advertising, does not
          sell data to third parties, and does not share it outside the
          Business except where this policy or the law requires.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Legal Basis &amp; Compliance
        </h2>
        <p>
          The Business processes personal data in accordance with
          Tanzania's Personal Data Protection Act, 2022, and its
          regulations. Where required under the Act, the Business is
          registered — or is completing registration — as a data
          controller with the Personal Data Protection Commission (PDPC).
          Staff data is collected only for the lawful purpose of operating
          the Business and is not used beyond that purpose without notice.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Data Storage &amp; Security
        </h2>
        <p>
          Data is stored using Firebase and Google Cloud infrastructure, and
          access is protected by authentication and role-based access
          rules: agents can only reach the screens and actions their role
          permits, and only administrators can manage products, categories,
          users, and business-wide settings. A signed-in session remains
          active for a limited period before staff are required to sign in
          again.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Data Retention
        </h2>
        <p>
          Business records — products, stock movements, and sales — are
          retained for as long as needed for the Business's operational and
          reporting needs. Staff account information is retained while the
          account is active and for a reasonable period after
          deactivation, after which it may be deleted at the Business's
          discretion, unless a longer period is required by law.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Third-Party Processors
        </h2>
        <p>
          The System relies on Firebase (a Google Cloud product) for
          authentication and data storage. Google acts as a data processor
          on the Business's behalf and does not use the Business's data for
          its own purposes. No other third party is given access to System
          data.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Your Rights
        </h2>
        <p>
          Staff may request access to, correction of, or deletion of their
          own account information by contacting an administrator. Requests
          will be handled promptly, subject to any records the Business is
          required to retain for audit, tax, or legal purposes.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Children's Privacy
        </h2>
        <p>
          The System is an internal business tool intended for use by adult
          staff members only and is not directed at, nor knowingly used by,
          children.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Changes to This Policy
        </h2>
        <p>
          This policy may be updated from time to time to reflect changes
          in the System or applicable law. The "Last updated" date above
          reflects the most recent revision. Material changes will be
          communicated to staff.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Governing Law
        </h2>
        <p>
          This policy is governed by the laws of the United Republic of
          Tanzania, including the Personal Data Protection Act, 2022.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-text-primary">
          Contact
        </h2>
        <p>
          Questions about this policy or requests regarding your personal
          data can be directed to{" "}
          <strong className="font-medium text-text-primary">
            HEKIMA VERITAS & GENERAL SUPPLY COMPANY LIMITED
          </strong>{" "}
          at{" "}
          <a
            href="Tel:+255767178040"
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
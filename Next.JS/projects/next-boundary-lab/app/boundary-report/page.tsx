import Link from "next/link";
import { boundaryFacts, projectFileBoundaries } from "@/lib/boundaryFacts";

export default function BoundaryReportPage() {
  return (
    <main>
      <h1>Execution Boundary Report</h1>
      <p>
        This report is a Server Component with no request-time API, so it is
        eligible for build-time prerendering.
      </p>

      <section>
        <h2>Boundary facts</h2>
        {boundaryFacts.map((fact) => (
          <article key={fact.name}>
            <h3>{fact.name}</h3>
            <p>{fact.explanation}</p>
            <dl>
              <dt>Owner</dt>
              <dd>{fact.owner}</dd>
              <dt>Execution</dt>
              <dd>{fact.execution}</dd>
              <dt>Browser bundle</dt>
              <dd>{fact.browserBundle}</dd>
            </dl>
          </article>
        ))}
      </section>

      <section>
        <h2>Project files</h2>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Boundary</th>
              <th>Timing</th>
            </tr>
          </thead>
          <tbody>
            {projectFileBoundaries.map((entry) => (
              <tr key={entry.file}>
                <td>
                  <code>{entry.file}</code>
                </td>
                <td>{entry.boundary}</td>
                <td>{entry.timing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Link href="/">Return home</Link>
    </main>
  );
}

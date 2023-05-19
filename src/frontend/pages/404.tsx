import Link from 'next/link';

export default function FourOhFour() {
  return (
    <>
      <h3>404 - Page Not Found</h3>
      <h2>Try one of these:</h2>
      <ul>
        <li>
          <Link href="/">
            <a>Shop the OpenTelemetry Demo Store</a>
          </Link>
        </li>
        <li>
          <Link href="/jaeger">
            <a>Look at traces in Jaeger</a>
          </Link>
        </li>
        <li>
          <Link href="/grafana">
            <a>Look at metrics in Grafana</a>
          </Link>
        </li>
        <li>
          <Link href="/feature">
            <a>Adjust feature flags</a>
          </Link>
        </li>
        <li>
          <Link href="/loadgen">
            <a>Interact with the load generator</a>
          </Link>
        </li>
      </ul>
    </>
  );
}

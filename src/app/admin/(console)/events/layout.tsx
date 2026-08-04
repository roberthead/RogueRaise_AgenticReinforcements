import { ConsoleNav } from "@/components/rogue-raise/console-nav";

/**
 * Section chrome for the event list and every page beneath an event — detail,
 * agents, asset review, repo review, submissions, results.
 *
 * All of those keep `activeKey="events"`: they are inside the Events section,
 * not siblings of it. Depth within the section is what `<Breadcrumbs>` on each
 * of those pages expresses.
 */
export default function ConsoleEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConsoleNav activeKey="events" />
      {children}
    </>
  );
}

import OrganizerView from "@/components/organizer-view";

export default function Home() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrganizerView />
      </main>
    </div>
  );
}

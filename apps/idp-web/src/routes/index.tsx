import { createFileRoute } from '@tanstack/react-router';

import { DocumentProcessorPage } from '@/modules/document-processor/doc-processor-page';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return <DocumentProcessorPage />;
}

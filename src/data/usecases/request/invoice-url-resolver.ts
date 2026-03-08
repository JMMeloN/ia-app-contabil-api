export function resolveInvoiceFileUrl(invoice: any): string | undefined {
  return (
    invoice?.pdfUrl ||
    invoice?.pdf?.url ||
    invoice?.serviceInvoice?.pdfUrl ||
    invoice?.serviceInvoice?.pdf?.url ||
    invoice?.document?.pdfUrl ||
    invoice?.urls?.pdf ||
    invoice?.xmlUrl ||
    invoice?.serviceInvoice?.xmlUrl ||
    undefined
  );
}

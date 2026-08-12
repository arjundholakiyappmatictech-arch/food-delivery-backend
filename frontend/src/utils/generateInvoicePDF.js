import jsPDF from 'jspdf';

export function generateInvoicePdf(invoice, order) {
   const doc = new jsPDF();

   const pageWidth = doc.internal.pageSize.getWidth();

   let y = 20;

   // Header
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(24);
   doc.text('TOMATO', 20, y);

   doc.setFontSize(18);
   doc.text('INVOICE', pageWidth - 20, y, {
      align: 'right',
   });

   y += 8;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);

   doc.text('Food Delivery App', 20, y);

   y += 12;

   doc.setDrawColor(220, 220, 220);
   doc.line(20, y, pageWidth - 20, y);

   // Invoice information
   y += 12;

   doc.setFontSize(10);

   doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, y);

   doc.text(`Order ID: #${invoice.order_id}`, pageWidth - 20, y, {
      align: 'right',
   });

   y += 7;

   doc.text(`Generated: ${formatDate(invoice.generated_at)}`, 20, y);

   // Customer
   y += 15;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(12);
   doc.text('Customer', 20, y);

   y += 7;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);

   doc.text(invoice.user.full_name, 20, y);

   y += 6;

   doc.text(invoice.user.email, 20, y);

   y += 6;

   doc.text(`Phone: ${invoice.user.phone_number}`, 20, y);

   // Address
   y += 15;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(12);

   doc.text('Delivery Address', 20, y);

   y += 7;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);

   doc.text(invoice.address.address_line, 20, y);

   y += 6;

   doc.text(`${invoice.address.city}, ${invoice.address.state} - ${invoice.address.pincode}`, 20, y);

   // Items
   y += 15;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(12);

   doc.text('Order Items', 20, y);

   y += 8;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(10);

   doc.text('Item', 20, y);
   doc.text('Qty', 120, y);
   doc.text('Price', 145, y);
   doc.text('Total', 175, y);

   y += 5;

   doc.line(20, y, pageWidth - 20, y);

   y += 8;

   doc.setFont('helvetica', 'normal');

   order.order_items.forEach((item) => {
      const quantity = item.quantity;
      const price = Number(item.price_at_purchase);
      const itemTotal = quantity * price;

      doc.text(item.menu_item.name, 20, y);
      doc.text(String(quantity), 120, y);
      doc.text(`Rs. ${price.toFixed(2)}`, 145, y);
      doc.text(`Rs. ${itemTotal.toFixed(2)}`, 175, y);

      y += 7;
   });

   // Bill
   y += 8;

   doc.line(20, y, pageWidth - 20, y);

   y += 10;

   const itemTotal = order.order_items.reduce((sum, item) => sum + Number(item.price_at_purchase) * item.quantity, 0);

   addSummaryRow(doc, 'Item Total', itemTotal, y);

   y += 7;

   addSummaryRow(doc, 'Delivery Fee', Number(invoice.delivery_fee), y);

   y += 10;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(13);

   doc.text('Total', 145, y);

   doc.text(`Rs. ${Number(invoice.total).toFixed(2)}`, pageWidth - 20, y, {
      align: 'right',
   });

   // Payment
   y += 15;

   doc.setFontSize(11);
   doc.text('Payment', 20, y);

   y += 7;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);

   doc.text(`Method: ${formatPaymentMethod(invoice.payment.method)}`, 20, y);

   y += 6;

   doc.text(`Status: ${formatPaymentStatus(invoice.payment.status)}`, 20, y);

   // Footer
   y += 18;

   doc.setDrawColor(220, 220, 220);
   doc.line(20, y, pageWidth - 20, y);

   y += 10;

   doc.setFontSize(9);
   doc.setTextColor(100, 100, 100);

   doc.text('Thank you for ordering with Tomato!', pageWidth / 2, y, {
      align: 'center',
   });

   // Download
   doc.save(`Tomato-Invoice-${invoice.invoice_number}.pdf`);
}

function addSummaryRow(doc, label, value, y) {
   const pageWidth = doc.internal.pageSize.getWidth();

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);

   doc.text(label, 145, y);

   doc.text(`Rs. ${value.toFixed(2)}`, pageWidth - 20, y, {
      align: 'right',
   });
}

function formatDate(date) {
   return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
   });
}

function formatPaymentMethod(method) {
   return method.replaceAll('_', ' ').toUpperCase();
}

function formatPaymentStatus(status) {
   return status.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

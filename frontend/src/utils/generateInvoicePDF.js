import jsPDF from 'jspdf';

export function generateInvoicePdf(invoice, order = null) {
   const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.getWidth();

   let y = 20;

   const user = invoice?.user;
   const address = invoice?.address;

   // Invoice API uses `items`
   // Normal order API uses `order_items`
   const items = invoice?.items?.length ? invoice.items : order?.order_items || [];

   const payment = invoice?.payment || order?.order_payment;

   /*
    * HEADER
    */
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(24);
   doc.setTextColor(2, 6, 12);
   doc.text('TOMATO', 20, y);

   doc.setFontSize(18);
   doc.text('INVOICE', pageWidth - 20, y, {
      align: 'right',
   });

   y += 8;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);
   doc.setTextColor(90, 90, 90);
   doc.text('Food Delivery App', 20, y);

   y += 12;

   drawDivider(doc, y);

   /*
    * INVOICE INFORMATION
    */
   y += 12;

   doc.setFontSize(10);
   doc.setTextColor(60, 60, 60);

   doc.text(`Invoice Number: ${invoice?.invoice_number || 'N/A'}`, 20, y);

   doc.text(`Order ID: #${invoice?.order_id || order?.id || 'N/A'}`, pageWidth - 20, y, {
      align: 'right',
   });

   y += 7;

   doc.text(`Generated: ${formatDate(invoice?.generated_at)}`, 20, y);

   /*
    * CUSTOMER
    */
   y += 15;

   drawHeading(doc, 'Customer', y);

   y += 7;

   drawNormalText(doc, user?.full_name || 'N/A', 20, y);

   y += 6;

   drawNormalText(doc, user?.email || 'N/A', 20, y);

   if (user?.phone_number) {
      y += 6;
      drawNormalText(doc, `Phone: ${user.phone_number}`, 20, y);
   }

   /*
    * DELIVERY ADDRESS
    */
   y += 15;

   drawHeading(doc, 'Delivery Address', y);

   y += 7;

   drawNormalText(doc, address?.address_line || 'N/A', 20, y);

   if (address?.city || address?.state || address?.pincode) {
      y += 6;

      const addressLine = [address?.city, address?.state].filter(Boolean).join(', ');

      const location = [addressLine, address?.pincode].filter(Boolean).join(' - ');

      drawNormalText(doc, location, 20, y);
   }

   /*
    * ORDER ITEMS
    */
   y += 15;

   drawHeading(doc, 'Order Items', y);

   y += 8;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(10);
   doc.setTextColor(2, 6, 12);

   doc.text('Item', 20, y);
   doc.text('Qty', 120, y);
   doc.text('Price', 145, y);
   doc.text('Total', 175, y);

   y += 5;

   drawDivider(doc, y);

   y += 8;

   /*
    * THIS IS THE IMPORTANT PART
    */
   if (items.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      doc.text('No order items found.', 20, y);

      y += 10;
   } else {
      items.forEach((item) => {
         const quantity = Number(item?.quantity || 0);
         const price = Number(item?.price_at_purchase || 0);
         const total = quantity * price;

         const itemName = item?.menu_item?.name || item?.name || 'Unknown Item';

         /*
          * Item name
          */
         doc.setFont('helvetica', 'normal');
         doc.setFontSize(10);
         doc.setTextColor(60, 60, 60);

         doc.text(itemName, 20, y);

         /*
          * Quantity
          */
         doc.text(String(quantity), 120, y);

         /*
          * Price
          */
         doc.text(`Rs. ${price.toFixed(2)}`, 145, y);

         /*
          * Item Total
          */
         doc.text(`Rs. ${total.toFixed(2)}`, 175, y);

         y += 7;
      });
   }

   /*
    * BILL SUMMARY
    */
   y += 8;

   drawDivider(doc, y);

   y += 10;

   const itemSubtotal = items.reduce(
      (sum, item) => sum + Number(item?.price_at_purchase || 0) * Number(item?.quantity || 0),
      0,
   );

   addSummaryRow(doc, 'Item Subtotal', itemSubtotal, y);

   y += 7;

   addSummaryRow(doc, 'Delivery Fee', Number(invoice?.delivery_fee || 0), y);

   y += 10;

   doc.setFont('helvetica', 'bold');
   doc.setFontSize(13);
   doc.setTextColor(2, 6, 12);

   doc.text('Total', 145, y);

   doc.text(`Rs. ${Number(invoice?.total || 0).toFixed(2)}`, pageWidth - 20, y, {
      align: 'right',
   });

   /*
    * PAYMENT
    */
   if (payment) {
      y += 15;

      drawHeading(doc, 'Payment', y);

      y += 7;

      drawNormalText(doc, `Method: ${formatPaymentMethod(payment.method)}`, 20, y);

      y += 6;

      drawNormalText(doc, `Status: ${formatPaymentStatus(payment.status)}`, 20, y);

      if (payment.paid_at) {
         y += 6;

         drawNormalText(doc, `Paid At: ${formatDate(payment.paid_at)}`, 20, y);
      }
   }

   /*
    * FOOTER
    */
   y += 18;

   drawDivider(doc, y);

   y += 10;

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(9);
   doc.setTextColor(100, 100, 100);

   doc.text('Thank you for ordering with Tomato!', pageWidth / 2, y, {
      align: 'center',
   });

   /*
    * DOWNLOAD
    */
   doc.save(`Tomato-Invoice-${invoice?.invoice_number || invoice?.order_id}.pdf`);
}

/*
 * SUMMARY ROW
 */
function addSummaryRow(doc, label, value, y) {
   const pageWidth = doc.internal.pageSize.getWidth();

   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);
   doc.setTextColor(60, 60, 60);

   doc.text(label, 145, y);

   doc.text(`Rs. ${Number(value).toFixed(2)}`, pageWidth - 20, y, {
      align: 'right',
   });
}

/*
 * HEADING
 */
function drawHeading(doc, text, y) {
   doc.setFont('helvetica', 'bold');
   doc.setFontSize(12);
   doc.setTextColor(2, 6, 12);

   doc.text(text, 20, y);
}

/*
 * NORMAL TEXT
 */
function drawNormalText(doc, text, x, y) {
   doc.setFont('helvetica', 'normal');
   doc.setFontSize(10);
   doc.setTextColor(60, 60, 60);

   doc.text(text, x, y);
}

/*
 * DIVIDER
 */
function drawDivider(doc, y) {
   const pageWidth = doc.internal.pageSize.getWidth();

   doc.setDrawColor(220, 220, 220);
   doc.line(20, y, pageWidth - 20, y);
}

/*
 * DATE
 */
function formatDate(date) {
   if (!date) {
      return 'N/A';
   }

   return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
   });
}

/*
 * PAYMENT METHOD
 */
function formatPaymentMethod(method) {
   if (!method) {
      return 'N/A';
   }

   return method.replaceAll('_', ' ').toUpperCase();
}

/*
 * PAYMENT STATUS
 */
function formatPaymentStatus(status) {
   if (!status) {
      return 'N/A';
   }

   return status.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

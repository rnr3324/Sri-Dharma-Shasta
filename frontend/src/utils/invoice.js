const printable = (value) => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '?')
const rupees = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

export async function downloadInvoice(order) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const width = pdf.internal.pageSize.getWidth()
  const margin = 16
  const right = width - margin
  const safe = (value) => printable(value)
  const line = (y) => { pdf.setDrawColor(216, 175, 55); pdf.setLineWidth(.25); pdf.line(margin, y, right, y) }
  const addItemsHeader = (y) => {
    pdf.setFillColor(39, 28, 18); pdf.rect(margin, y - 5, right - margin, 10, 'F')
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(243, 229, 171)
    pdf.text('PRODUCT', margin + 3, y + 1); pdf.text('QTY', 128, y + 1, { align: 'right' }); pdf.text('UNIT PRICE', 159, y + 1, { align: 'right' }); pdf.text('AMOUNT', right - 3, y + 1, { align: 'right' })
  }

  pdf.setFillColor(22, 15, 10); pdf.rect(0, 0, width, 43, 'F')
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(19); pdf.setTextColor(243, 229, 171); pdf.text('SRI DHARMA SHASTA', margin, 19)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(221, 199, 143); pdf.text('POOJA KITS & SEVA SERVICES', margin, 26)
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(17); pdf.setTextColor(212, 175, 55); pdf.text('INVOICE', right, 19, { align: 'right' })
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(245, 233, 201)
  pdf.text(`Order: ${safe(order.ref)}`, right, 27, { align: 'right' })
  const created = order.createdAt ? new Date(order.createdAt) : new Date(order.date || Date.now())
  pdf.text(`Date: ${created.toLocaleDateString('en-IN')}`, right, 33, { align: 'right' })

  let y = 54
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(139, 27, 46); pdf.text('BILL TO', margin, y)
  pdf.text('PAYMENT METHOD', 112, y)
  y += 7
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(35, 29, 20); pdf.text(safe(order.customer?.name || 'Customer'), margin, y)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(70, 64, 54)
  let customerY = y + 6
  for (const value of [order.customer?.phone, order.customer?.email, order.customer?.address, order.customer?.pin ? `PIN ${order.customer.pin}` : '']) {
    if (!value) continue
    const wrapped = pdf.splitTextToSize(safe(value), 88)
    pdf.text(wrapped, margin, customerY); customerY += wrapped.length * 4.5
  }
  const pay = order.pay === 'cod' ? 'Cash on Delivery' : 'Online payment (UPI)'
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(35, 29, 20); pdf.text(pay, 112, y)
  if (order.utr) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(70, 64, 54); pdf.text(`Transaction reference: ${safe(order.utr)}`, 112, y + 6) }
  y = Math.max(customerY, y + 18) + 5
  line(y); y += 9; addItemsHeader(y); y += 11

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(35, 29, 20)
  for (const item of (order.items || [])) {
    const nameLines = pdf.splitTextToSize(safe(item.name), 95)
    const height = Math.max(9, nameLines.length * 4.5 + 4)
    if (y + height > 270) { pdf.addPage(); y = 22; addItemsHeader(y); y += 11; pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(35, 29, 20) }
    pdf.text(nameLines, margin + 3, y)
    pdf.text(String(item.qty), 128, y, { align: 'right' })
    pdf.text(rupees(item.price), 159, y, { align: 'right' })
    pdf.text(rupees(item.price * item.qty), right - 3, y, { align: 'right' })
    y += height; line(y); y += 7
  }
  if (y > 255) { pdf.addPage(); y = 24 }
  const totalRow = (label, amount, strong = false) => {
    pdf.setFont('helvetica', strong ? 'bold' : 'normal'); pdf.setFontSize(strong ? 12 : 10); pdf.setTextColor(strong ? 139 : 55, strong ? 27 : 48, strong ? 46 : 36)
    pdf.text(label, 128, y, { align: 'right' }); pdf.text(typeof amount === 'string' ? amount : rupees(amount), right - 3, y, { align: 'right' }); y += strong ? 10 : 7
  }
  totalRow('Subtotal', order.subtotal)
  if (order.discount) totalRow('Discount', `- ${rupees(order.discount)}`)
  totalRow('Shipping', order.shipping)
  line(y); y += 8; totalRow('TOTAL', order.total, true)
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(100, 92, 78)
  pdf.text('Thank you for your order. Swamiye Saranam Ayyappa.', margin, Math.min(y + 14, 285))
  pdf.save(`Sri-Dharma-Shasta-Invoice-${safe(order.ref).replace(/[^A-Za-z0-9-]/g, '') || 'order'}.pdf`)
}

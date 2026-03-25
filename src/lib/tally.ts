import { supabase } from './supabase';

/**
 * TallyPrime XML Integration Library
 * This library handles XML generation and parsing for TallyPrime's HTTP interface.
 */

const TALLY_URL = import.meta.env.VITE_TALLY_URL || '/api/tally'; // Use proxy in dev, or env var in prod

async function fetchTally(xml: string) {
  const response = await fetch(TALLY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xml,
  });
  if (!response.ok) throw new Error('Failed to connect to Tally');
  const text = await response.text();
  return new DOMParser().parseFromString(text, 'text/xml');
}

/**
 * Syncs Sundry Debtors from Tally to Supabase
 */
export async function syncTallyCustomers(userId: string) {
  const xml = `
    <ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Accounts</REPORTNAME>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <ACCOUNTTYPE>Ledger</ACCOUNTTYPE>
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>
  `;

  const doc = await fetchTally(xml);
  const ledgers = Array.from(doc.getElementsByTagName('LEDGER'));
  
  // Filter for Sundry Debtors (standard Tally group)
  const debtors = ledgers.filter(l => {
    const parent = l.getElementsByTagName('PARENT')[0]?.textContent;
    return parent?.toLowerCase().includes('sundry debtors');
  });

  const customersToUpsert = debtors.map(d => ({
    user_id: userId,
    name: d.getAttribute('NAME') || 'Unknown',
    phone: d.getElementsByTagName('LEDGERPHONE')[0]?.textContent || '',
    email: d.getElementsByTagName('EMAILID')[0]?.textContent || '',
    address: d.getElementsByTagName('ADDRESS')[0]?.textContent || '',
    gstin: d.getElementsByTagName('GSTOUTFEDREGISTRATIONNO')[0]?.textContent || '',
  }));

  if (customersToUpsert.length > 0) {
    const { error } = await supabase
      .from('customers')
      .upsert(customersToUpsert, { onConflict: 'user_id,name' });
    if (error) throw error;
  }

  return customersToUpsert.length;
}

/**
 * Syncs Sales Vouchers (Invoices) and Receipt Vouchers (Payments)
 */
export async function syncTallyVouchers(userId: string) {
  const xml = `
    <ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>Day Book</REPORTNAME>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>
  `;

  const doc = await fetchTally(xml);
  const vouchers = Array.from(doc.getElementsByTagName('VOUCHER'));
  
  // Get all customers first to map ledger names to IDs
  const { data: customerList } = await supabase.from('customers').select('id, name').eq('user_id', userId);
  const customerMap = new Map(customerList?.map(c => [c.name, c.id]));

  let syncCount = { invoices: 0, payments: 0 };

  for (const v of vouchers) {
    const vType = v.getElementsByTagName('VOUCHERTYPENAME')[0]?.textContent;
    const dateStr = v.getElementsByTagName('DATE')[0]?.textContent; // Format usually YYYYMMDD
    const date = dateStr ? `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}` : new Date().toISOString();
    
    // Primary party is usually the first Ledger Entry
    const partyName = v.getElementsByTagName('PARTYLEDGERNAME')[0]?.textContent;
    const customerId = partyName ? customerMap.get(partyName) : null;

    if (!customerId) continue;

    if (vType?.toLowerCase().includes('sales')) {
      const amount = Math.abs(parseFloat(v.getElementsByTagName('AMOUNT')[0]?.textContent || '0'));
      const invNo = v.getElementsByTagName('VOUCHERNUMBER')[0]?.textContent || 'TALLY-' + Math.random().toString(36).substr(2, 5);
      
      await supabase.from('invoices').upsert([{
        id: invNo,
        user_id: userId,
        customer_id: customerId,
        total_amount: amount,
        status: 'Unpaid',
        created_at: date
      }]);
      syncCount.invoices++;
    } 
    else if (vType?.toLowerCase().includes('receipt')) {
      const amount = Math.abs(parseFloat(v.getElementsByTagName('AMOUNT')[0]?.textContent || '0'));
      await supabase.from('payments').insert([{
        user_id: userId,
        customer_id: customerId,
        amount: amount,
        payment_method: 'Tally Sync',
        payment_date: date
      }]);
      syncCount.payments++;
    }
  }

  return syncCount;
}

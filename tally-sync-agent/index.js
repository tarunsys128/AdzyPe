import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import 'dotenv/config';

// Add configuration details inside .env file in this directory
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // The anon or service_role key
const tallyUrl = process.env.TALLY_URL || 'http://localhost:9000';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncInvoicesToTally() {
  console.log('Checking for unsynced invoices...');
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, customers(name)')
    .eq('tally_synced', false)
    .limit(10);
    
  if (error) {
    console.error('Error fetching invoices from Supabase:', error);
    return;
  }
  
  if (!invoices.length) {
    console.log('No new invoices to sync.');
    return;
  }

  for (const inv of invoices) {
    // Tally XML format for a standard Sales Voucher
    // Replaces hyphens in dates e.g. 2024-04-12 -> 20240412
    const dateFormatted = new Date(inv.created_at).toISOString().split('T')[0].replace(/-/g, '');
    const customerName = inv.customers?.name || 'Unknown Customer';

    const xmlRequest = `
<ENVELOPE>
  <HEADER>
    <VERSION>1</VERSION>
    <TALLYREQUEST>Import</TALLYREQUEST>
    <TYPE>Data</TYPE>
    <ID>Vouchers</ID>
  </HEADER>
  <BODY>
    <DESC></DESC>
    <DATA>
      <TALLYMESSAGE>
        <VOUCHER>
          <DATE>${dateFormatted}</DATE>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${inv.id.substring(0,8)}</VOUCHERNUMBER>
          <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
          <ISINVOICE>No</ISINVOICE>
          <LEDGERENTRIES.LIST>
            <LEDGERNAME>${customerName}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
            <AMOUNT>-${inv.total_amount}</AMOUNT>
          </LEDGERENTRIES.LIST>
          <LEDGERENTRIES.LIST>
            <LEDGERNAME>Sales</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${inv.total_amount}</AMOUNT>
          </LEDGERENTRIES.LIST>
        </VOUCHER>
      </TALLYMESSAGE>
    </DATA>
  </BODY>
</ENVELOPE>`;

    try {
      console.log(`Syncing invoice ${inv.id.substring(0,8)} to Tally...`);
      const response = await fetch(tallyUrl, {
        method: 'POST',
        body: xmlRequest,
        headers: { 'Content-Type': 'text/xml' }
      });
      const responseText = await response.text();
      
      // Tally typically responds with <CREATED>1</CREATED> upon success
      if (responseText.includes('<CREATED>1</CREATED>') || responseText.includes('<UPDATED>1</UPDATED>')) {
        console.log(`✅ Successfully synced invoice ${inv.id.substring(0,8)} to Tally.`);
        
        // Update the database to mark it synced
        await supabase.from('invoices').update({ tally_synced: true }).eq('id', inv.id);
      } else {
        console.error(`❌ Failed to sync invoice ${inv.id.substring(0,8)}. Tally Response:\n`, responseText);
      }
    } catch (err) {
      console.error(`Tally connection error for invoice ${inv.id.substring(0,8)}:\nMake sure TallyPrime is open and listening on ${tallyUrl}\nError Output:`, err.message);
    }
  }
}

// Start polling every 15 seconds
const SYNC_INTERVAL = 15000;
setInterval(syncInvoicesToTally, SYNC_INTERVAL);
console.log('🚀 Tally Sync Agent started.');
console.log(`Polling Supabase every ${SYNC_INTERVAL / 1000} seconds for new invoices...`);
syncInvoicesToTally();

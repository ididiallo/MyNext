'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from '@/node_modules/next/cache';
import { redirect } from '@/node_modules/next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
 export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
        customerId:formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
// convert the amount in cent 
      const amountInCent = amount * 100;
      const date = new Date().toISOString().split('T')[0];
//create a new sql querry to insert the new invoice into the database and pass a new variable 
      await sql `
      INSERT INTO invoices (customer_Id, amount, status, date)
      VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
      `;
//clear cache and revalidating a new request
      revalidatePath("/dashboard/invoices");
      //redirect the user back to invoice page 
      redirect('/dashboard/invoices')
}


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 //Extracting the data from formData.
export async function updateInvoice(id: string, formData: FormData) {
  
  //Validating the types with Zod.
      const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 //converting the amount to cents
  const amountInCents = amount * 100;
 //Passing the variables to your SQL query.
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  //Calling revalidatePath to clear the client cache and make a new server request.

  revalidatePath('/dashboard/invoices');

  //  Calling redirect to redirect the user to the invoice's page.
  redirect('/dashboard/invoices');
}



export async function deleteInvoice(id: string) {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
    }

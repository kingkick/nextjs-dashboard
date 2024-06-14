// 通过添加 'use server'，您将文件中的所有导出函数标记为服务器函数。然后可以将这些服务器函数导入到 Client 和 Server 组件中，使它们变得非常灵活。
// 您还可以通过在 action 内部添加 "use server" 直接在 Server Component 中编写 Server Actions。
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  // amount 字段被专门设置为强制（更改）从字符串更改为数字，同时还验证其类型。
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // omit 忽略

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// prevState - 包含从 useFormState hook 传递的状态。在此示例中，您将不会在 action 中使用它，但它是一个必需的属性。
export async function createInvoice(preState: State, formData: FormData) {
  // 提示：如果您正在处理包含许多字段的 forms，您可能想考虑使用 JavaScript 的 Object.fromEntries() 方法与 entries() 方法。
  // 例如： const rawFormData = Object.fromEntries(formData.entries())

  // Validate form fields using Zod
  // safeParse() 将返回一个包含 success 或 error 字段的对象。这将有助于更优雅地处理验证，而无需将此逻辑放在 try/catch 块中。
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  console.log('validatedFields ->', validatedFields);

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    const ret = {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };

    console.error('errors ->', ret.errors);

    return ret;
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Next.js 拥有一个客户端路由缓存，它在用户的浏览器中存储路由段一段时间。除了prefetching，此缓存确保用户在路由之间快速导航的同时减少向服务器发出的请求次数。
  // 由于您正在更新发票路由中显示的数据，因此您希望清除此缓存并触发对服务器的新请求。您可以使用 Next.js 的 revalidatePath 函数来实现：
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  preState: State,
  formData: FormData,
) {
  // console.log('formData ->', formData.get('id'));

  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  // console.log('updateInvoice.amountInCents ->', amountInCents);

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

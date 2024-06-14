'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();

  // ${pathname} 是当前路径，在您的案例中是 "/dashboard/invoices"。
  const pathname = usePathname();

  // 使用了 useRouter 路由 Hook 以实现更平滑的客户端过渡。
  const { replace } = useRouter();

  // 当用户在搜索栏中键入时，params.toString() 将此输入转换为友好的 URL 格式。
  // 这个函数将包装 handleSearch 的内容，并且只有在用户停止输入一段时间后（300 毫秒）才运行代码。
  const handleSearch = useDebouncedCallback((term) => {
    // console.log(`Searching... ${term}`);
    /*
    您在每次按键时都更新了 URL，因此在每次按键时都在查询数据库！虽然在我们的应用程序中这不是问题，但想象一下如果您的应用程序有数千用户，每个用户在每次按键时都向数据库发送新请求，那将会是一个问题。

    防抖是一种编程实践，用于限制函数触发的速率。在我们的情况下，只有在用户停止输入时才希望查询数据库。

    防抖的工作原理：
    触发事件：当发生应该被防抖的事件（比如搜索框中的按键）时，定时器启动。
    等待：如果在计时器到期之前发生新事件，则重置计时器。
    执行：如果计时器达到倒计时结束，将执行防抖函数。

    您可以以几种方式实现防抖，包括手动创建自己的防抖函数。为了保持简单，我们将使用一个名为 use-debounce 的库。
    */

    const params = new URLSearchParams(searchParams);
    // 当用户键入新的搜索查询时，您希望将页码重置为 1。
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // 更新 URL，其中包含用户的搜索数据。例如，如果用户搜索 "Lee"，则为 /dashboard/invoices?query=lee。
    // 更新后触发page重取url参数，才能更新页面table组件
    replace(`${pathname}?${params.toString()}`);
  }, 600);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

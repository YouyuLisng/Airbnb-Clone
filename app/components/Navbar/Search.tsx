'use client';

import qs from 'query-string';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { BiSearch } from 'react-icons/bi';

const Search = () => {
    const router = useRouter();
    const params = useSearchParams();

    const [keyword, setKeyword] = useState(params?.get('keyword') || '');

    const onSearch = useCallback(() => {
        let currentQuery = {};

        if (params) {
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            keyword: keyword || undefined,
        };

        const url = qs.stringifyUrl({
            url: '/',
            query: updatedQuery
        }, { skipNull: true });

        router.push(url);
    }, [keyword, params, router]);

    return (
        <div className="border border-neutral-300 w-full md:w-auto rounded-md shadow-sm focus-within:border-emerald-700 transition flex flex-row items-stretch">
            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                placeholder="搜尋裝備名稱..."
                className="px-4 py-2.5 text-sm outline-none rounded-l-md w-full md:w-64"
            />
            <button
                onClick={onSearch}
                aria-label="搜尋"
                className="flex flex-row items-center px-3 bg-emerald-600 rounded-r-md text-white hover:bg-emerald-700 transition"
            >
                <BiSearch size={18} />
            </button>
        </div>
    );
}

export default Search;

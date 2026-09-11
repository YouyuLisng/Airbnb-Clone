
import getCurrentUser from './actions/getCurrentUser';
import getGear, {
    IGearParams
} from "@/app/actions/getGear";
import ClientOnly from './components/ClientOnly'
import Container from './components/Container'
import EmptyState from './components/EmptyState';
import GearCard from './components/Gear/GearCard';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from './components/ui/pagination';

export const dynamic = 'force-dynamic' // 部署會遇到 Error: Dynamic server usage: searchParams.userId

interface HomeProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildPageHref(params: Record<string, string | string[] | undefined>, page: number) {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (key === 'page' || value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((v) => search.append(key, v));
        } else {
            search.append(key, value);
        }
    });

    if (page > 1) {
        search.set('page', String(page));
    }

    const query = search.toString();
    return query ? `/?${query}` : '/';
}

const Home = async ({ searchParams } : HomeProps) => {
    const resolvedParams = await searchParams;
    const pageParam = resolvedParams.page;
    const page = typeof pageParam === 'string' ? Number(pageParam) : undefined;

    const gearParams: IGearParams = {
        userId: typeof resolvedParams.userId === 'string' ? resolvedParams.userId : undefined,
        keyword: typeof resolvedParams.keyword === 'string' ? resolvedParams.keyword : undefined,
        category: typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined,
        page: page && page > 0 ? page : 1,
    };

    const { gear, totalPages } = await getGear(gearParams);
    const currentUser = await getCurrentUser();

    if(gear.length === 0) {
        return (
            <ClientOnly>
                <EmptyState showReset />
            </ClientOnly>
        )
    }

    const currentPage = gearParams.page ?? 1;

    return (
        <ClientOnly>
            <Container>
                <div className='pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8'>
                    {gear.map((item) => {
                        return (
                            <GearCard
                                currentUser={currentUser}
                                key={item.id}
                                data={item}
                            />
                        )
                    })}
                </div>
                {totalPages > 1 && (
                    <Pagination className="pb-10 pt-6">
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        text="上一頁"
                                        href={buildPageHref(resolvedParams, currentPage - 1)}
                                    />
                                </PaginationItem>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                <PaginationItem key={pageNumber}>
                                    <PaginationLink
                                        href={buildPageHref(resolvedParams, pageNumber)}
                                        isActive={pageNumber === currentPage}
                                    >
                                        {pageNumber}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        text="下一頁"
                                        href={buildPageHref(resolvedParams, currentPage + 1)}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                )}
            </Container>
        </ClientOnly>
    )
}

export default Home;

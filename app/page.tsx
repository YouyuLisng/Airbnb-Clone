
import getCurrentUser from './actions/getCurrentUser';
import getGear, {
    IGearParams
} from "@/app/actions/getGear";
import ClientOnly from './components/ClientOnly'
import Container from './components/Container'
import EmptyState from './components/EmptyState';
import GearCard from './components/Gear/GearCard';

export const dynamic = 'force-dynamic' // 部署會遇到 Error: Dynamic server usage: searchParams.userId

interface HomeProps {
    searchParams: Promise<IGearParams>
}

const Home = async ({ searchParams } : HomeProps) => {
    const gear = await getGear(await searchParams);
    const currentUser = await getCurrentUser();
    if(gear.length === 0) {
        return (
            <ClientOnly>
                <EmptyState showReset />
            </ClientOnly>
        )
    }
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
            </Container>
        </ClientOnly>
    )
}

export default Home;

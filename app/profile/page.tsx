import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ProfileClient from "./ProfileClient";

const ProfilePage = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="請登入"
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <ProfileClient currentUser={currentUser} />
        </ClientOnly>
    );
}

export default ProfilePage;

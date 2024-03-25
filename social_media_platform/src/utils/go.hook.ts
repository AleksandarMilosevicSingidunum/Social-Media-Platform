import { useRouter } from "vue-router";

export function useGo() {

    const router = useRouter()

    function go(to: string) {
        router.push({
            path: to
        })
    }

    return go
}
import { HeaderStyles } from '@/app/styles/cards'
import { Text, View } from '@/components/Themed'
import { Link } from 'expo-router'
import { Image } from 'react-native'

import { usePathname } from 'expo-router'
import { useEffect, useState } from 'react'

export default function HeaderPage() {
    return (
        <>
            <View style={{ ...HeaderStyles.container }}>
                <Image source={require("../assets/images/My_Space.png")} style={HeaderStyles.image} />
            </View>
            <View style={{ height: 32, borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 14, flexDirection: "row", gap: 20, alignItems: "flex-start", marginTop: 12 }}>
                <Onglet title="Notes" url="/myspace" />
                <Onglet title="Groupes" url="/myspace/group" />
                <Onglet title="Archives" url="/myspace/archives" />
            </View>
        </>
    )
}


const Onglet = ({ title, url = "/myspace" }: { title: string, url: string }) => {
    const [active, setActive] = useState(false)
    const paths = usePathname()
    useEffect(() => {
        setActive(paths === url)
    }, [paths])

    return (<Link replace href={url} style={active ? { borderBottomWidth: 2, height: 32 } : null}>
        <Text style={{ fontSize: 16, fontWeight: active ? 'bold' : 'normal' }}>{title}</Text>
    </Link>)
}
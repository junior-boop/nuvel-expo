import { HeaderStyles } from '@/app/styles/cards'
import { Text, View } from '@/components/Themed'
import { Link } from 'expo-router'
import { Animated, Image } from 'react-native'

import { usePathname } from 'expo-router'
import { useEffect, useState } from 'react'

const BANNER_HEIGHT = HeaderStyles.container.height as number

export default function HeaderPage({ scrollY }: { scrollY?: Animated.Value }) {
    const clampedScroll = scrollY ? Animated.diffClamp(scrollY, 0, BANNER_HEIGHT) : null

    const bannerHeight = clampedScroll
        ? clampedScroll.interpolate({
            inputRange: [0, BANNER_HEIGHT],
            outputRange: [BANNER_HEIGHT, 0],
            extrapolate: 'clamp',
        })
        : BANNER_HEIGHT

    const bannerOpacity = clampedScroll
        ? clampedScroll.interpolate({
            inputRange: [0, BANNER_HEIGHT * 0.6, BANNER_HEIGHT],
            outputRange: [1, 0.3, 0],
            extrapolate: 'clamp',
        })
        : 1

    return (
        <>
            <Animated.View style={[HeaderStyles.container, { height: bannerHeight, opacity: bannerOpacity, overflow: 'hidden' }]}>
                <Image source={require("../../assets/images/My_Space.png")} style={HeaderStyles.image} />
            </Animated.View>
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
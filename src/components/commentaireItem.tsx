import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowCircleUp20Filled, FluentSubtractCircle12Regular } from "@/constants/icons";
import { addsignal, addupvote } from "@/lib/instantdb.comment";
import { CommentType } from "@/lib/instantdb.init";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable } from "react-native";
import { Text, View } from "./Themed";

export default function CommentaireItem({ comment, index, articleId, userId }: { comment: CommentType, index: number, articleId: string, userId: string }) {
    const { name, first_name, photo } = comment.creator

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: convert(16), paddingHorizontal: convert(16), }} key={index}>
            <View style={{ width: convert(42), height: convert(42), borderRadius: convert(21), overflow: 'hidden', backgroundColor: '#777' }}>
                {
                    photo
                        ? <Image
                            style={{ width: convert(42), height: convert(42) }}
                            source={{ uri: `https://${photo}` }} />
                        : <Image
                            style={{ width: convert(42), height: convert(42) }}
                            source={require('@/assets/images/avatar.png')} />
                }
            </View>
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }}>
                    <Text style={{ fontSize: convert(12), fontWeight: 'bold', color: '#252525ff' }}>{name} {first_name}</Text>
                    <Text style={{ fontSize: convert(12), fontStyle: "italic", color: '#252525ff' }}>• {moment(comment.created).fromNow()}</Text>
                </View>
                <Text style={{ fontSize: convert(16), color: '#202020ff', width: w * 0.7 }}>{comment.content}</Text>
                <View style={{ marginTop: convert(8), flexDirection: 'row', alignItems: 'center', gap: convert(24) }}>
                    <Upvotes id={articleId} commentId={comment.id} userId={userId} comment={comment} />
                    <Signals id={articleId} commentId={comment.id} userId={userId} comment={comment} />
                </View>
            </View>

        </View>
    )
}

export const upVoteHooks = ({ id, commentId, userId, comment }: { id: string, commentId: string, userId: string, comment: CommentType }) => {
    const [isUpvoted, setIsUpvoted] = useState(false)
    const [upvotesCount, setUpvotesCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const toggleUpvote = useCallback(async () => {
        setLoading(true)
        try {

            if (comment.upvotes.includes(userId)) {
                const upvotes = comment.upvotes.filter((upvote: string) => upvote !== userId)
                await addupvote(commentId, upvotes, comment.notes - 1)
                setIsUpvoted(!isUpvoted)
                setUpvotesCount(comment.notes - 1)
            } else {
                const upvotes = [...comment.upvotes, userId]
                await addupvote(commentId, upvotes, comment.notes + 1)
                setIsUpvoted(!isUpvoted)
                setUpvotesCount(comment.notes + 1)
            }
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [comment])

    useEffect(() => {
        setIsUpvoted(comment.upvotes.includes(userId))
        setUpvotesCount(comment.notes)
    }, [comment])
    return {
        isUpvoted,
        toggleUpvote,
        upvotesCount,
        loading,
        error
    }
}

export const signalHooks = ({ id, commentId, userId, comment }: { id: string, commentId: string, userId: string, comment: CommentType }) => {
    const [isSignaled, setIsSignaled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const toggleSignal = useCallback(async () => {
        setLoading(true)
        try {

            if (comment.signals.includes(userId)) {
                const signals = comment.signals.filter((signal: string) => signal !== userId)
                await addsignal(commentId, signals)
                setIsSignaled(!isSignaled)
            } else {
                const signals = [...comment.signals, userId]
                await addsignal(commentId, signals)
                setIsSignaled(!isSignaled)
            }
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [comment])

    useEffect(() => {
        setIsSignaled(comment.signals.includes(userId))
    }, [comment])

    return {
        isSignaled,
        toggleSignal,
        loading,
        error
    }
}


const Upvotes = ({ id, commentId, userId, comment }: { id: string, commentId: string, userId: string, comment: CommentType }) => {
    const { isUpvoted, toggleUpvote, upvotesCount, loading, error } = upVoteHooks({ id, commentId, userId, comment })
    return (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }} onPress={toggleUpvote}>
            <FluentArrowCircleUp20Filled width={24} height={24} color={isUpvoted ? '#006effff' : '#777'} />
            <Text style={{ fontSize: convert(16), color: isUpvoted ? '#006effff' : '#777', fontWeight: 'bold' }}>{upvotesCount}</Text>
        </Pressable>
    )
}
const Signals = ({ id, commentId, userId, comment }: { id: string, commentId: string, userId: string, comment: CommentType }) => {
    const { isSignaled, toggleSignal, loading, error } = signalHooks({ id, commentId, userId, comment })
    return (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }} onPress={toggleSignal}>
            <FluentSubtractCircle12Regular width={24} height={24} color={isSignaled ? '#f82a2aff' : '#777'} />
            <Text style={{ fontSize: convert(16), color: isSignaled ? '#f82a2aff' : '#777', fontWeight: 'bold' }}>Signal</Text>
        </Pressable>
    )
}
import { CommentsProps } from "@/app/reader";
import { w } from "@/constants/Colors";
import { convert } from "@/constants/convert";
import { FluentArrowCircleUp20Filled, FluentSubtractCircle12Regular } from "@/constants/icons";
import { useCommentInteractions } from "@/lib/useCommentUpvoteSignal";
import moment from "moment";
import { Image, Pressable } from "react-native";
import { Text, View } from "./Themed";

export default function CommentaireItem({ comment, index, articleId, userId }: { comment: CommentsProps, index: number, articleId: string, userId: string }) {
    const { name, first_name, photo } = JSON.parse(comment.creator)
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
                    <Text style={{ fontSize: convert(14), fontWeight: 'bold', color: '#252525ff' }}>{name} {first_name}</Text>
                    <Text style={{ fontSize: convert(14), fontStyle: "italic", color: '#252525ff' }}>• {moment(comment.created).fromNow()}</Text>
                </View>
                <Text style={{ fontSize: convert(16), color: '#202020ff', width: w * 0.7 }}>{comment.content}</Text>
                <View style={{ marginTop: convert(8), flexDirection: 'row', alignItems: 'center', gap: convert(24) }}>
                    <Upvotes id={articleId} commentId={comment.id} userId={userId} />
                    <Signals id={articleId} commentId={comment.id} userId={userId} />
                </View>
            </View>

        </View>
    )
}


const Upvotes = ({ id, commentId, userId }: { id: string, commentId: string, userId: string }) => {
    const { isUpvoted, toggleUpvote, upvotesCount, loading, error } = useCommentInteractions(id, commentId, userId)
    return (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }} onPress={toggleUpvote}>
            <FluentArrowCircleUp20Filled width={24} height={24} color={isUpvoted ? '#006effff' : '#777'} />
            <Text style={{ fontSize: convert(16), color: isUpvoted ? '#006effff' : '#777', fontWeight: 'bold' }}>{upvotesCount}</Text>
        </Pressable>
    )
}
const Signals = ({ id, commentId, userId }: { id: string, commentId: string, userId: string }) => {
    const { isSignaled, toggleSignal, signalsCount, loading, error } = useCommentInteractions(id, commentId, userId)
    return (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: convert(5) }} onPress={toggleSignal}>
            <FluentSubtractCircle12Regular width={24} height={24} color={isSignaled ? '#f82a2aff' : '#777'} />
            <Text style={{ fontSize: convert(16), color: isSignaled ? '#f82a2aff' : '#777', fontWeight: 'bold' }}>Signal</Text>
        </Pressable>
    )
}
import { Text, View } from "@/components/Themed";
import { convert } from "@/constants/convert";
import { FluentCheckmark28Filled } from "@/constants/icons";
import { useBottomSheetBackHandler } from "@/lib/useBottomSheetBackHandler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export const TOPICS: { category: string; items: string[] }[] = [
    {
        category: "Foundations of Faith",
        items: [
            "Grace and Salvation",
            "Faith and Works",
            "Repentance",
            "The New Birth",
            "Identity in Christ",
            "Justification and Sanctification",
        ],
    },
    {
        category: "Daily Spiritual Life",
        items: [
            "Prayer and Intercession",
            "Fasting",
            "Meditating on the Word",
            "Hearing God's Voice",
            "Praise and Worship",
            "Gratitude",
        ],
    },
    {
        category: "Trials and Battles",
        items: [
            "Suffering and the Meaning of Trials",
            "Spiritual Warfare",
            "Temptation and How to Resist It",
            "Doubt and Wavering Faith",
            "Waiting and the Silence of God",
            "Inner Healing",
        ],
    },
    {
        category: "Character and Growth",
        items: [
            "The Fruit of the Spirit (love, joy, peace, patience...)",
            "Humility",
            "Forgiveness (Receiving and Giving)",
            "Self-Control",
            "Integrity",
            "Perseverance",
        ],
    },
    {
        category: "Relationships",
        items: [
            "Marriage and Couples According to the Bible",
            "Family and Raising Children",
            "Friendship and Community (Koinonia)",
            "Loving Your Enemies",
            "Reconciliation",
            "Singleness",
        ],
    },
    {
        category: "Practical Life",
        items: [
            "Money, Tithing, and Generosity",
            "Work as a Calling",
            "Rest and the Sabbath",
            "Decisions and God's Will",
            "Anxiety and Trusting God",
            "Contentment",
        ],
    },
    {
        category: "Doctrine and Theology",
        items: [
            "The Trinity",
            "The Person of the Holy Spirit",
            "The Cross and Atonement",
            "The Resurrection",
            "The Church, Body of Christ",
            "Spiritual Gifts",
        ],
    },
    {
        category: "Hope and the End Times",
        items: [
            "The Return of Christ",
            "Heaven and Eternity",
            "Judgment",
            "Living in Hope",
            "Death and Christian Grief",
        ],
    },
    {
        category: "Mission and Witness",
        items: [
            "Evangelism",
            "Service (Diakonia)",
            "Social Justice and Compassion",
            "Being Salt and Light",
            "Discipleship",
        ],
    },
    {
        category: "The Fruit of the Spirit",
        items: [
            "Love (Agape)",
            "Joy",
            "Peace",
            "Patience",
            "Kindness",
            "Goodness",
            "Faithfulness",
            "Gentleness",
            "Self-Control",
        ],
    },
];

export default function TopicPicker({ selected, onClose, onChange }: { selected: string[]; onClose: () => void; onChange: (topics: string[]) => void }) {
    const sheetRef = useRef<BottomSheet>(null);

    useBottomSheetBackHandler(true, () => onClose?.());

    const toggle = (topic: string) => {
        if (selected.includes(topic)) {
            onChange(selected.filter((t) => t !== topic));
        } else {
            onChange([...selected, topic]);
        }
    };

    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={["80%"]}
            enableDynamicSizing={false}
            enablePanDownToClose={true}
            containerStyle={{ backgroundColor: '#0003' }}
            onClose={onClose}
        >
            <BottomSheetView style={{ flex: 1, height: '100%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: convert(20), paddingVertical: convert(12), borderBottomWidth: 1, borderColor: '#cfdfeeff' }}>
                    <Text style={{ fontSize: convert(18), fontWeight: '600' }}>Topics</Text>
                    <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: convert(12), paddingVertical: convert(6) }}>
                        <Text style={{ fontSize: convert(16), color: '#0083ff', fontWeight: '600' }}>Done</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: convert(20), paddingBottom: convert(50), paddingTop: convert(4) }}>
                    {TOPICS.map((section) => (
                        <View key={section.category}>
                            <Text style={{ fontSize: convert(13), fontWeight: '700', color: '#0009', textTransform: 'uppercase', marginTop: convert(16), marginBottom: convert(4) }}>{section.category}</Text>
                            {section.items.map((topic) => {
                                const isSelected = selected.includes(topic);
                                return (
                                    <TouchableOpacity
                                        key={topic}
                                        onPress={() => toggle(topic)}
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: convert(12), borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                                    >
                                        <Text style={{ fontSize: convert(15), flex: 1, paddingRight: convert(8) }}>{topic}</Text>
                                        {isSelected && <FluentCheckmark28Filled width={18} height={18} color={'#0083ff'} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            </BottomSheetView>
        </BottomSheet>
    );
}

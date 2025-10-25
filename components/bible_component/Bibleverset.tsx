import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
// import filtre from './livre';


type FilterProps = {
    chapitre: string;
    vers: {
        n: number;
        v: string;
    }[];
    versChar: string;
    reference: string;
}


type attrsProps = {
    attrs: {
        content: {
            n: string,
            text: string
        }[],
        ref_bible: string
    },
    type: string
}
export default function BibleVerset({ node }: { node: attrsProps }) {
    const [content, setContent] = useState<{
        n: string,
        text: string
    }[] | null>(node.attrs.content)
    const [ref_bible, setRef_bible] = useState<string>(node.attrs.ref_bible)


    return (
        <NodeViewWrapper className="bible-ref">
            <div>
                <p style={{ fontWeight: 'bold' }}>{ref_bible}</p>
            </div>
            <div className='px-4 pb-3'>
                {
                    content?.map((el) => (<span key={el.n} style={{ lineHeight: 1.5, fontSize: '17px' }}><span style={{ display: 'inline-block', padding: "0 5px", fontSize: 12, fontWeight: 'bold', verticalAlign: 'middle' }}>{el.n}</span >{el.text}</span>))
                }
            </div>
        </NodeViewWrapper>

    )
}


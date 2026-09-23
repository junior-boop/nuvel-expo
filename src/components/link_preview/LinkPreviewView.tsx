import { NodeViewWrapper } from '@tiptap/react'
import { useEffect, useRef } from 'react'
import { ImagePlaceholderIcon } from '../../editor/editor_icons'
import type { LinkPreviewAttrs, LinkPreviewData } from './extension'

const domainFromUrl = (url: string) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '')
    } catch {
        return url
    }
}

export default function LinkPreviewView({ node, updateAttributes, extension }: {
    node: { attrs: LinkPreviewAttrs }
    updateAttributes: (attrs: Partial<LinkPreviewAttrs>) => void
    extension: { options: { fetchPreview?: (url: string) => Promise<LinkPreviewData | null> } }
}) {
    const { url, title, domain, image, status } = node.attrs
    // Le NodeView est recree a chaque frappe autour du node atomique : sans ce garde-fou,
    // chaque re-render relancerait un fetch tant que status reste "loading".
    const hasStartedRef = useRef(false)

    useEffect(() => {
        if (status !== 'loading' || hasStartedRef.current) return
        hasStartedRef.current = true

        const fetchPreview = extension.options.fetchPreview
        if (!fetchPreview) {
            updateAttributes({ status: 'error', domain: domainFromUrl(url) })
            return
        }

        fetchPreview(url).then((data) => {
            if (data) {
                updateAttributes({
                    title: data.title ?? domainFromUrl(url),
                    description: data.description ?? null,
                    image: data.image ?? null,
                    domain: data.domain ?? domainFromUrl(url),
                    status: 'ready',
                })
            } else {
                updateAttributes({ status: 'error', domain: domainFromUrl(url) })
            }
        }).catch(() => {
            updateAttributes({ status: 'error', domain: domainFromUrl(url) })
        })
    }, [status, url])

    return (
        <NodeViewWrapper className="link-preview-card" contentEditable={false}>
            <a href={url} onClick={(e) => e.preventDefault()}>
                <div className="link-preview-body">
                    <p className="link-preview-title">
                        {status === 'loading' ? 'Chargement de l\u2019aper\u00e7u\u2026' : (title || url)}
                    </p>
                    <p className="link-preview-domain">{domain || domainFromUrl(url)}</p>
                </div>
                <div className="link-preview-thumb">
                    {image
                        ? <img src={image} alt="" onError={() => updateAttributes({ image: null })} />
                        : <ImagePlaceholderIcon width={22} height={22} />}
                </div>
            </a>
        </NodeViewWrapper>
    )
}

import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {MenuIcon} from '@sanity/icons/Menu'
import {DocumentIcon} from '@sanity/icons/Document'
import {PinIcon} from '@sanity/icons/Pin'
import {CommentIcon} from '@sanity/icons/Comment'

/** Singletons are pinned; everything else lists normally. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages')),

      S.listItem()
        .title('Location pages')
        .icon(PinIcon)
        .child(S.documentTypeList('locationPage').title('Location pages')),

      S.listItem()
        .title('Testimonials')
        .icon(CommentIcon)
        .child(S.documentTypeList('testimonial').title('Testimonials')),

      S.divider(),

      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),

      S.listItem()
        .title('Navigation')
        .icon(MenuIcon)
        .child(S.document().schemaType('navigation').documentId('navigation')),
    ])

/** Types managed as singletons — hidden from the global "create new" menu. */
export const SINGLETONS = ['siteSettings', 'navigation']

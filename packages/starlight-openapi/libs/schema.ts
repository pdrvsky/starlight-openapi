import type OpenAPIParser from '@readme/openapi-parser'
import { z, type ZodType, type ZodOptional } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'

import type { PathItemOperation } from './operation'
import { getBaseLink, stripLeadingAndTrailingSlashes } from './path'
import { getPathItemSidebarGroups, getWebhooksSidebarGroups } from './pathItem'
import { makeSidebarGroup, makeSidebarLink, type SidebarLink, type SidebarManualGroup } from './starlight'

export const SchemaConfigSchema = z.object({
  /**
   * The base path containing the generated documentation.
   * @example 'api/petstore'
   */
  base: z.string().min(1).transform(stripLeadingAndTrailingSlashes),
  /**
   * Whether the generated documentation sidebar group should be collapsed by default.
   * @default true
   */
  collapsed: z.boolean().default(true),
  /**
   * The generated documentation sidebar group label.
   */
  label: z.string().optional(),
  /**
   * The OpenAPI/Swagger schema path or URL.
   */
  schema: z.string().min(1),
  /**
   * The OpenAPIParser configuration.
   */
  openApiParserConfig: z.any().optional() as ZodOptional<ZodType<OpenAPIParser.Options>>,
  /**
   * The operation title getter
   */
  getOperationTitle: z
    .function()
    .args(z.any() as ZodType<PathItemOperation>)
    .returns(z.any() as ZodType<SidebarLink>)
    .optional(),
})

export function getSchemaSidebarGroups(schema: Schema): SidebarManualGroup {
  const { config, document } = schema

  return makeSidebarGroup(
    config.label ?? document.info.title,
    [
      makeSidebarLink('Overview', getBaseLink(config)),
      ...getPathItemSidebarGroups(schema),
      ...getWebhooksSidebarGroups(schema),
    ],
    config.collapsed,
  )
}

export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  document: OpenAPI.Document
}

import { z } from 'zod'

export const ToolCategorySchema = z.enum(['image', 'pdf', 'text', 'developer', 'utility'])
export const ToolStatusSchema = z.enum(['stable', 'beta', 'planned'])

export const ToolDefinitionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: ToolCategorySchema,
  titleKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  keywords: z.array(z.string().min(1)),
  aliases: z.array(z.string().min(1)),
  icon: z.string().min(1),
  inputKinds: z.array(z.string().min(1)),
  outputKinds: z.array(z.string().min(1)),
  localOnly: z.boolean(),
  featured: z.boolean().optional(),
  related: z.array(z.string().min(1)),
  status: ToolStatusSchema,
})

export const ToolRegistrySchema = z.array(ToolDefinitionSchema)

export type ToolCategory = z.infer<typeof ToolCategorySchema>
export type ToolStatus = z.infer<typeof ToolStatusSchema>
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>

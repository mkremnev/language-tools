import { expect } from 'chai';
import ts from 'typescript/lib/tsserverlibrary';
import { CompletionContext, CompletionTriggerKind } from 'vscode-languageserver-protocol';
import { InsertTextFormat, Position, Range } from 'vscode-languageserver-types';
import { CompletionsProviderImpl } from '../../../../src/plugins/astro/features/CompletionsProvider';
import { LanguageServiceManager } from '../../../../src/plugins/typescript/LanguageServiceManager';
import { createEnvironment } from '../../../utils';

describe('Astro Plugin#CompletionsProvider', () => {
	function setup(filePath: string) {
		const env = createEnvironment(filePath, 'astro', 'completions');
		const languageServiceManager = new LanguageServiceManager(env.docManager, [env.fixturesDir], env.configManager, ts);
		const provider = new CompletionsProviderImpl(languageServiceManager);

		return {
			...env,
			provider,
		};
	}

	it('provide completion for frontmatter - frontmatter is null', async () => {
		const { provider, document } = setup('frontmatter.astro');

		const completions = await provider.getCompletions(document, Position.create(0, 1), <CompletionContext>{
			triggerKind: CompletionTriggerKind.TriggerCharacter,
			triggerCharacter: '-',
		});

		expect(completions?.items).to.deep.equal([
			{
				commitCharacters: [],
				detail: 'Create component script block',
				insertText: '---\n$0\n---',
				insertTextFormat: 2,
				kind: 15,
				label: '---',
				preselect: true,
				sortText: '\u0000',
				textEdit: {
					newText: '---\n$0\n---',
					range: Range.create(0, 0, 0, 1),
				},
			},
		]);
	});

	it('provide completion for frontmatter - frontmatter is open', async () => {
		const { provider, document } = setup('closeFrontmatter.astro');

		const completions = await provider.getCompletions(document, Position.create(2, 1), <CompletionContext>{
			triggerKind: CompletionTriggerKind.TriggerCharacter,
			triggerCharacter: '-',
		});

		expect(completions?.items).to.deep.equal([
			{
				commitCharacters: [],
				detail: 'Close component script block',
				insertText: '---',
				insertTextFormat: 2,
				kind: 15,
				label: '---',
				preselect: true,
				sortText: '\u0000',
				textEdit: {
					newText: '---',
					range: Range.create(2, 0, 2, 1),
				},
			},
		]);
	});

	it('provide completion for frontmatter - triple dashes already inputted', async () => {
		const { provider, document } = setup('tripledashesFrontmatter.astro');

		const completions = await provider.getCompletions(document, Position.create(0, 2), <CompletionContext>{
			triggerKind: CompletionTriggerKind.TriggerCharacter,
			triggerCharacter: '-',
		});

		expect(completions?.items).to.deep.equal([
			{
				commitCharacters: [],
				detail: 'Create component script block',
				insertText: '---\n$0\n---',
				insertTextFormat: 2,
				kind: 15,
				label: '---',
				preselect: true,
				sortText: '\u0000',
				textEdit: {
					newText: '---\n$0\n---',
					range: Range.create(0, 0, 0, 2),
				},
			},
		]);
	});

	it('provide prop completions in starting tag of Astro components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(10, 20));

		expect(completions?.items).to.deep.equal([
			{
				label: 'name',
				detail: 'string',
				insertText: 'name="$1"',
				insertTextFormat: InsertTextFormat.Snippet,
				commitCharacters: [],
				sortText: '\u0000',
			},
		]);
	});

	it('provide prop completions in starting tag of Vue components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(11, 14));

		expect(completions?.items).to.deep.contain({
			label: 'name?',
			detail: 'string',
			insertText: 'name="$1"',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '_',
			filterText: 'name',
		});
	});

	it('provide prop completions in starting tag of Vue components with props defined using TypeScript', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(12, 16));

		expect(completions?.items).to.deep.contain({
			label: 'name',
			detail: 'string',
			insertText: 'name="$1"',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '\u0000',
		});
	});

	it('provide prop completions in starting tag of Svelte components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(13, 26));

		expect(completions?.items).to.deep.contain({
			label: 'name',
			detail: 'any',
			insertText: 'name={$1}',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '\u0000',
		});
	});

	it('provide prop completions in starting tag of JSX components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(14, 14));

		expect(completions?.items).to.deep.contain({
			label: 'name',
			detail: 'any',
			insertText: 'name={$1}',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '\u0000',
		});
	});

	it('provide prop completions in starting tag of JSX components with .d.ts definitions', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(15, 17));

		expect(completions?.items).to.deep.contain({
			label: 'name',
			detail: 'string',
			insertText: 'name="$1"',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '\u0000',
		});
	});

	it('provide prop completions in starting tag of TSX components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(16, 14));

		expect(completions?.items).to.deep.contain({
			label: 'name',
			detail: 'string',
			insertText: 'name="$1"',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '\u0000',
		});
	});

	it('provide client directives completions for non-astro components', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(13, 26));

		expect(completions?.items).to.deep.contain({
			label: 'client:load',
			kind: 12,
			documentation: {
				kind: 'markdown',
				value:
					'Start importing the component JS at page load. Hydrate the component when import completes.\n\n[Astro reference](https://docs.astro.build/en/reference/directives-reference/#clientload)',
			},
			textEdit: { range: Range.create(13, 26, 13, 26), newText: 'client:load' },
			insertTextFormat: 2,
			command: undefined,
		});
	});

	it('mark optional props with a ?', async () => {
		const { provider, document } = setup('optional.astro');

		const completions = await provider.getCompletions(document, Position.create(4, 15));
		const item = completions?.items.find((completion) => completion.filterText === 'name');

		expect(item).to.deep.equal({
			label: 'name?',
			detail: 'string',
			insertText: 'name="$1"',
			insertTextFormat: InsertTextFormat.Snippet,
			commitCharacters: [],
			sortText: '_',
			filterText: 'name',
		});
	});

	it('does not provide prop completions inside of a component', async () => {
		const { provider, document } = setup('component.astro');

		const completions = await provider.getCompletions(document, Position.create(7, 22));

		expect(completions?.items).to.be.empty;
	});
});

import { expect } from 'chai';
import ts from 'typescript/lib/tsserverlibrary';
import { SignatureHelpTriggerKind } from 'vscode-languageserver-protocol';
import { CodeActionKind, Position, Range } from 'vscode-languageserver-types';
import { TypeScriptPlugin } from '../../../src/plugins';
import { LanguageServiceManager } from '../../../src/plugins/typescript/LanguageServiceManager';
import { createEnvironment } from '../../utils';

// This file only contain basic tests to ensure that the TypeScript plugin does in fact calls the proper methods
// and returns something. For validity tests, please check the providers themselves in the 'features' folder

describe('TypeScript Plugin', () => {
	function setup(filePath: string) {
		const env = createEnvironment(filePath, 'typescript');
		const plugin = new TypeScriptPlugin(
			env.configManager,
			new LanguageServiceManager(env.docManager, [env.fixturesDir], env.configManager, ts)
		);

		return {
			...env,
			plugin,
		};
	}

	describe('provide document symbols', async () => {
		it('return document symbols', async () => {
			const { plugin, document } = setup('documentSymbols/documentSymbols.astro');

			const symbols = await plugin.getDocumentSymbols(document);
			expect(symbols).to.not.be.empty;
		});

		it('should not provide documentSymbols if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('documentSymbols/documentSymbols.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					documentSymbols: {
						enabled: false,
					},
				},
			});

			const symbols = await plugin.getDocumentSymbols(document);
			const isEnabled = await configManager.isEnabled(document, 'typescript', 'documentSymbols');

			expect(isEnabled).to.be.false;
			expect(symbols).to.be.empty;
		});
	});

	describe('provide completions', async () => {
		it('return completions', async () => {
			const { plugin, document } = setup('completions/basic.astro');

			const completions = await plugin.getCompletions(document, Position.create(1, 8));
			expect(completions).to.not.be.empty;
		});

		it('should not provide completions if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('completions/basic.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					completions: {
						enabled: false,
					},
				},
			});

			const completions = await plugin.doHover(document, Position.create(1, 8));

			const isEnabled = await configManager.isEnabled(document, 'typescript', 'completions');

			expect(isEnabled).to.be.false;
			expect(completions).to.be.null;
		});
	});

	describe('provide hover info', async () => {
		it('return hover info', async () => {
			const { plugin, document } = setup('hoverInfo/basic.astro');

			const hoverInfo = await plugin.doHover(document, Position.create(1, 10));
			expect(hoverInfo).to.not.be.empty;
		});

		it('should not provide hover info if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('hoverInfo/basic.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					hover: {
						enabled: false,
					},
				},
			});

			const hoverInfo = await plugin.doHover(document, Position.create(1, 10));

			const isEnabled = await configManager.isEnabled(document, 'typescript', 'hover');

			expect(isEnabled).to.be.false;
			expect(hoverInfo).to.be.null;
		});
	});

	describe('provide diagnostics', async () => {
		it('return diagnostics', async () => {
			const { plugin, document } = setup('diagnostics/basic.astro');

			const diagnostics = await plugin.getDiagnostics(document);
			expect(diagnostics).to.not.be.empty;
		});

		it('should not provide diagnostics if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('diagnostics/basic.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					diagnostics: {
						enabled: false,
					},
				},
			});

			const diagnostics = await plugin.getDiagnostics(document);
			expect(diagnostics).to.be.empty;
		});
	});

	describe('provide code actions', async () => {
		it('return code actions', async () => {
			const { plugin, document } = setup('codeActions/basic.astro');

			const codeActions = await plugin.getCodeActions(document, Range.create(2, 23, 2, 33), {
				diagnostics: [
					{
						code: 2551,
						message: '',
						range: Range.create(2, 23, 2, 33),
						source: 'ts',
					},
				],
				only: [CodeActionKind.QuickFix],
			});

			expect(codeActions).to.not.be.empty;
		});

		it('should not provide code actions if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('codeActions/basic.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					codeActions: {
						enabled: false,
					},
				},
			});

			const codeActions = await plugin.getCodeActions(document, Range.create(2, 23, 2, 33), {
				diagnostics: [
					{
						code: 2551,
						message: '',
						range: Range.create(2, 23, 2, 33),
						source: 'ts',
					},
				],
				only: [CodeActionKind.QuickFix],
			});

			const isEnabled = await configManager.isEnabled(document, 'typescript', 'codeActions');

			expect(isEnabled).to.be.false;
			expect(codeActions).to.be.empty;
		});
	});

	describe('provide semantic tokens', async () => {
		it('return semantic tokens for full document', async () => {
			const { plugin, document } = setup('semanticTokens/frontmatter.astro');

			const semanticTokens = await plugin.getSemanticTokens(document);
			expect(semanticTokens).to.not.be.null;
		});

		it('return semantic tokens for range', async () => {
			const { plugin, document } = setup('semanticTokens/frontmatter.astro');

			const semanticTokens = await plugin.getSemanticTokens(document, Range.create(0, 0, 12, 0));
			expect(semanticTokens).to.not.be.null;
		});

		it('should not provide semantic tokens if feature is disabled', async () => {
			const { plugin, document, configManager } = setup('semanticTokens/frontmatter.astro');

			configManager.updateGlobalConfig(<any>{
				typescript: {
					semanticTokens: {
						enabled: false,
					},
				},
			});

			const semanticTokens = await plugin.getSemanticTokens(document);
			const isEnabled = await configManager.isEnabled(document, 'typescript', 'semanticTokens');

			expect(isEnabled).to.be.false;
			expect(semanticTokens).to.be.null;
		});
	});

	describe('provide inlay hints', async () => {
		it('return inlay hints', async () => {
			const { plugin, document, configManager } = setup('inlayHints/basic.astro');

			configManager.updateGlobalConfig(
				{
					typescript: {
						inlayHints: {
							parameterNames: {
								enabled: 'all',
							},
							parameterTypes: {
								enabled: 'all',
							},
						},
					},
				},
				true
			);

			const inlayHints = await plugin.getInlayHints(document, Range.create(0, 0, 7, 0));
			expect(inlayHints).to.not.be.empty;
		});
	});

	describe('provide definitions', async () => {
		it('return definitions', async () => {
			const { document, plugin } = setup('definitions/sameFile.astro');

			const functionDefinition = await plugin.getDefinitions(document, Position.create(1, 11));
			expect(functionDefinition).to.not.be.empty;
		});
	});

	describe('provide type definitions', async () => {
		it('return type definitions', async () => {
			const { document, plugin } = setup('typeDefinitions/sameFile.astro');

			const variableDeclaration = await plugin.getTypeDefinitions(document, Position.create(2, 10));
			expect(variableDeclaration).to.not.be.empty;
		});
	});

	describe('provide references', async () => {
		it('return references', async () => {
			const { document, plugin } = setup('references/frontmatter.astro');

			const references = await plugin.findReferences(document, Position.create(3, 1), {
				includeDeclaration: true,
			});
			expect(references).to.not.be.empty;
		});
	});

	describe('provide folding ranges', async () => {
		it('return folding ranges', async () => {
			const { plugin, document } = setup('foldingRanges/frontmatter.astro');

			const foldingRanges = await plugin.getFoldingRanges(document);
			expect(foldingRanges).to.not.be.empty;
		});
	});

	describe('provide signature help', async () => {
		it('return signature help', async () => {
			const { plugin, document } = setup('signatureHelper/basic.astro');

			const signatureHelp = await plugin.getSignatureHelp(document, Position.create(1, 12), {
				triggerKind: SignatureHelpTriggerKind.Invoked,
				isRetrigger: false,
			});

			expect(signatureHelp).to.not.be.null;
		});
	});
});

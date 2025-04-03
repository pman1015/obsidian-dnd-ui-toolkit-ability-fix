import { AbilityBlock, AbilityModifier, AbilityScores } from 'lib/types';
import { parse } from 'yaml';

export function parseAbilityBlock(yamlString: string): AbilityBlock {
	const parsed = parse(yamlString);
	const abilities = parsed.abilities || {};
	const modifiersArray = parsed.modifiers || [];
	const orZero = (value?: number) => {
		if (value === undefined) {
			return 0;
		}
		return value
	}
	const abilityScores: AbilityScores = {
		strength: orZero(abilities.strength),
		dexterity: orZero(abilities.dexterity),
		constitution: orZero(abilities.constitution),
		intelligence: orZero(abilities.intelligence),
		wisdom: orZero(abilities.wisdom),
		charisma: orZero(abilities.charisma),
	};
	// Parse modifiers
	const modifiers: AbilityModifier[] = Array.isArray(modifiersArray)
		? modifiersArray.filter(mod =>
			mod &&
			typeof mod.name === 'string' &&
			typeof mod.target === 'string' &&
			typeof mod.value === 'number' &&
			['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(mod.target)
		)
		: [];
	return {
		abilities: abilityScores,
		modifiers: modifiers
	};
}

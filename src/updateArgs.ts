import {EditorState} from '@codemirror/state';

export class UpdateArgs{

	state: EditorState;
	updateFromEditor: boolean;

	constructor(state: EditorState, updateFromEditor: boolean){
		this.state = state;
		this.updateFromEditor = updateFromEditor;
	}
}
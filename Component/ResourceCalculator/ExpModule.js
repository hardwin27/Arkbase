import React, {Component} from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Picker,
    TextInput,
	ScrollView
} from 'react-native';

import styles from '../../assets/Stylesheet/styles.js';
import picker from '../../assets/Stylesheet/picker.js';

class ExpModule extends Component {
    state = {
		errorStatement:-1,
        stageExp: 0,
        stageLmd: 0,
        sanityUsedExp: 0,
        dropAmountExp: 0,
        sanityUsedLmd: 0,
        dropAmountLmd: 0,
		opRarity: -1,
        opCurrentElite: -1,
        opCurrentLevel: 0,
        opTargetedElite: -1,
        opTargetedLevel: 0,
		opExpReqAllElite: this.props.expReq,
		opLmdReq: this.props.lmdReq,
        opLevelLimit: this.props.levelLimit,
        stageData: this.props.stageData,
		lmdData: this.props.lmdData,
        totalExpNeeded: 0,
        totalRunExp: 0,
		totalSanityExp: 0,
        totalRunLmd: 0,
		totalSanityLmd: 0,
		totalLmd: 0,
        overflowExp: 0,
        overflowLmd: 0
    }

    changeExpCalculationParameter(stageIndex) {
        let data = this.state.stageData[parseInt(stageIndex)];
        this.setState({dropAmountExp: data["dropAmount"]});
        this.setState({sanityUsedExp: data["sanityUsed"]});
    }
	changeLmdCalculationParameter(stageIndex) {
        let data = this.state.lmdData[parseInt(stageIndex)];
        this.setState({dropAmountLmd: data["dropAmount"]});
        this.setState({sanityUsedLmd: data["sanityUsed"]});
    }

    calculateExp(rarity, currentElite, currentLevel, targetedElite, targetedLevel, sanityExp, dropExp, sanityLmd, dropLmd) {
		if(parseInt(currentLevel) > Number.MAX_SAFE_INTEGER || parseInt(targetedLevel) > Number.MAX_SAFE_INTEGER) {
			this.setState({errorStatement: "Value too big"});
			return;
		}
		currentLevel = parseInt(currentLevel);
		targetedLevel = parseInt(targetedLevel);
        let expReqPerLevel = this.state.opExpReqAllElite;
		let levelLimit = this.state.opLevelLimit;
		let promoteCost = this.state.opLmdReq.PromoteCost	;
		let upgradeCost = this.state.opLmdReq.UpgradeCost;
		let totalExp = 0;
		let totalCost = 0;
        let runAmountExp = 0;
        let runAmountLmd = 0;
        let overflowExp = 0;
        let overflowLmd = 0;

		//no rarity is choosen
		if(rarity == 0)
		{this.setState({errorStatement:'Please select operator rarity'});}
		//no stage is choosen
		else if (this.state.stageExp == 0)
			{this.setState({errorStatement:'Please select EXP stage'});}

		//no stage is choosen
		else if(this.state.stageLmd == 0)
			{this.setState({errorStatement:'Please select LMD stage'});}

		//no currentElite is choosen
		else if (currentElite == -1)
			{this.setState({errorStatement:'Please select current operator elite'});}

		//no targetedElite is choosen
		else if (targetedElite == -1)
			{this.setState({errorStatement:'Please select targeted operator elite'});}

		//currentElite is greater than targetedElite
		else if (currentElite > targetedElite)
			{this.setState({errorStatement:'Current elite cannot be greater than targeted elite'});}

		//same elite, but currentLevel is greater or equal to targetedLevel
		else if (
			currentElite == targetedElite &&
			currentLevel >= targetedLevel &&
			currentLevel !=0 &&
			targetedLevel !=0
		)
			{this.setState({errorStatement:'Current level cannot be greater or equal than targeted level'});}


		//currentLevel or targetedLevel is not a number
		else if (isNaN(currentLevel) || isNaN(targetedLevel))
			{this.setState({errorStatement:'Please enter a number'});}



		//currentLevel is zero
		else if (currentLevel <= 0)
			{this.setState({errorStatement:'Current level cannot be zero or lower'});}

		//targetedLevel is zero
		else if (targetedLevel <= 0)
			{this.setState({errorStatement:'Targeted level cannot be zero or lower'});}

		//currentElite or targetedElite is not available for that rarity
		else if (levelLimit[rarity][currentElite] == -1 || levelLimit[rarity][targetedElite] == -1)
			{this.setState({errorStatement:'This rarity does not have this elite'});}


		//currentLevel exceed levelLimit of that rarity and elite
		else if (currentLevel > levelLimit[rarity][currentElite])
			{this.setState({errorStatement:'Level limit for E'+currentElite+' '+rarity+' star operator is '+levelLimit[rarity][currentElite]});}

		//targetedLevel exceed levelLimit of that rarity and elite
		else if (targetedLevel > levelLimit[rarity][targetedElite])
			{this.setState({errorStatement:'Level limit for E'+targetedElite+' '+rarity+' star operator is '+levelLimit[rarity][targetedElite]});}
		else{
			this.setState({errorStatement:''});
	        while((currentElite <= targetedElite) && !(currentElite == targetedElite && currentLevel >= targetedLevel)) {
	            if(currentLevel == levelLimit[rarity][currentElite]) {
					totalCost += promoteCost[rarity][currentElite];
	                currentLevel = 1;
					currentElite++;
					continue;
	            }
				totalExp += expReqPerLevel[currentElite][currentLevel];
				totalCost += upgradeCost[currentElite][currentLevel];
				currentLevel++;
	        }
		}
        runAmountExp = Math.ceil(totalExp / dropExp);
		overflowExp = (dropExp*runAmountExp) - totalExp;
		this.setState({totalExpNeeded: totalExp});
		this.setState({totalRunExp: runAmountExp});
		this.setState({totalSanityExp: runAmountExp*sanityExp});
		this.setState({overflowExp: overflowExp});

		runAmountLmd = Math.ceil(totalCost / dropLmd);
        overflowLmd = (dropLmd*runAmountLmd) - totalCost;
		this.setState({totalLmd: totalCost})
		this.setState({totalRunLmd: runAmountLmd});
		this.setState({totalSanityLmd: runAmountLmd*sanityLmd});
		this.setState({overflowLmd: overflowLmd});
    }
	getResult(){
		//no errorStatement
		if(this.state.errorStatement==''){
			return(
				<View style={{width:'80%'}}>
					<Text style={styles.textRequire}>Require:</Text>
					<Text style={styles.textLeft}>{parseInt(this.state.totalExpNeeded)} exp</Text>
					<Text style={styles.textLeft}>{parseInt(this.state.totalRunExp)} run</Text>
					<Text style={styles.textLeft}>{parseInt(this.state.totalSanityExp)} sanity</Text>
					<Text style={styles.textLeft}></Text>
					<Text style={styles.textLeft}>{parseInt(this.state.totalLmd)} LMD </Text>
					<Text style={styles.textLeft}>{this.state.totalRunLmd} run</Text>
					<Text style={styles.textLeft}>{parseInt(this.state.totalSanityLmd)} sanity</Text>
					<Text style={styles.textLeft}> </Text>
					<Text style={styles.textLeft}>You will get {parseInt(this.state.overflowExp)} extra EXP</Text>
					<Text style={styles.textLeft}>You will get {parseInt(this.state.overflowLmd)} extra Lmd</Text>
				</View>
			)
		//uninitialized errorStatement
		}else if (this.state.errorStatement==-1) {
			return(
				null
			)
		//errorStatement was thrown
		}else{
			return(
				<View>
					<Text style={styles.textError}>{this.state.errorStatement}</Text>
				</View>
			)
		}
	}
	//change the style of component underline if there's an error
	styleUnderline(value,componentType,component){
		//check whether error statement is thrown or not. if not, use normal color
		if(this.state.errorStatement==('' || -1) ){
			if(componentType=='picker'){
				if(component == 'currentElite' || component ==  'targetedElite' || component == 'stageExp' || component == 'stageLmd'){
					return(
						picker.underline_100
					)
				}else{
					return(
						picker.underline
					)
				}
			}else{
				return(
					styles.input_100
				)
			}
		}else{
			switch (component) {
				//input component error parameter, must be specifically to each of the input to make the error specific
				case 'stageExp':
						//error parameter
						if(
							this.state.stageExp == 0
						){
							//if error, change underline to error style
							return(
								picker.underlineError_100
							)
						}else{
							//if not error, use normal underline
							return(
								picker.underline_100
							)
						}
					break;
				case 'stageLmd':
						//error parameter
						if(
							this.state.stageLmd == 0
						){
							//if error, change underline to error style
							return(
								picker.underlineError_100
							)
						}else{
							//if not error, use normal underline
							return(
								picker.underline_100
							)
						}
					break;
				case 'rarity':
						if(
							this.state.opRarity == 0
						){
							return(
								picker.underlineError
							)
						}else{
							return(
								picker.underline
							)
						}
					break;
				case 'currentElite':
						if(
							this.state.opCurrentElite == -1 ||
							(
								this.state.opCurrentElite == this.state.opTargetedElite &&
								this.state.opCurrentLevel >= this.state.opTargetedLevel
							) ||
							(
								this.state.opCurrentElite > this.state.opTargetedElite &&
								this.state.opTargetedElite != -1
							)
						){
							return(
								picker.underlineError_100
							)
						}else{
							return(
								picker.underline_100
							)
						}
					break;
				case 'targetedElite':
						if(
							this.state.opTargetedElite == -1 ||
							(
								this.state.opCurrentElite == this.state.opTargetedElite &&
								this.state.opCurrentLevel >= this.state.opTargetedLevel
							) ||
							this.state.opCurrentElite > this.state.opTargetedElite
						){
							return(
								picker.underlineError_100
							)
						}else{
							return(
								picker.underline_100
							)
						}
					break;
				case 'currentLevel':
						if(
							isNaN(this.state.opCurrentLevel) ||
							this.state.opCurrentLevel == '' ||
							this.state.opCurrentLevel == 0 ||
							this.state.opLevelLimit[this.state.opRarity][this.state.currentElite] == -1 ||
							this.state.opCurrentLevel > this.state.opLevelLimit[this.state.opRarity][this.state.opCurrentElite] ||
							(
								this.state.opCurrentElite == this.state.opTargetedElite &&
								this.state.opCurrentLevel >= this.state.opTargetedLevel
							)
						){
							return(
								styles.inputError_100
							)
						}else{
							return(
								styles.input_100
							)
						}
					break;
				case 'targetedLevel':
						if(
							isNaN(this.state.opTargetedLevel) ||
							this.state.opTargetedLevel == '' ||
							this.state.opTargetedLevel == 0 ||
							this.state.opLevelLimit[this.state.opRarity][this.state.opTargetedElite] == -1 ||
							this.state.opTargetedLevel > this.state.opLevelLimit[this.state.opRarity][this.state.opTargetedElite] ||
							(
								this.state.opCurrentElite == this.state.opTargetedElite &&
								this.state.opCurrentLevel >= this.state.opTargetedLevel
							)
						){
							return(
								styles.inputError_100
							)
						}else{
							return(
								styles.input_100
							)
						}
					break;
				default:
					if(componentType=='picker'){
						if(component == (currentElite || targetedElite || stageExp || stageLmd)){
							return(
								picker.underline_100
							)
						}else{
							return(
								picker.underline
							)
						}
					}else{
						return(
							styles.input_100
						)
					}
					break;
			}
		}
	}
    render() {
        return(
            <View style={picker.container}>
				<View style={this.styleUnderline(this.state.opRarity,'picker', 'rarity')}>
					<Picker
						style={picker.style}
						selectedValue={this.state.opRarity}
						onValueChange={(itemValue, itemIndex) => this.setState({opRarity: itemValue})}
					>
						<Picker.Item label="Select operator rarity" value={0}/>
						<Picker.Item label="1 Star" value={1}/>
						<Picker.Item label="2 Stars" value={2}/>
						<Picker.Item label="3 Stars" value={3}/>
						<Picker.Item label="4 Stars" value={4}/>
						<Picker.Item label="5 Stars" value={5}/>
						<Picker.Item label="6 Stars" value={6}/>
					</Picker>
				</View>
				<View style={{width:'80%',flex:1,flexDirection:'row'}}>
					<View style={{flex:1,marginRight:10}}>
		                <View style={this.styleUnderline(this.state.stageExp,'picker', 'stageExp')}>
		                    <Picker
		                        style={picker.style}
		                        selectedValue={this.state.stageExp}
		                        onValueChange={(itemValue, itemIndex) => this.setState({stageExp: itemValue}, this.changeExpCalculationParameter(itemValue))}
		                    >
		                        <Picker.Item label="Select EXP stage" value={0}/>
		                        <Picker.Item label="LS-1" value={1}/>
		                        <Picker.Item label="LS-2" value={2}/>
		                        <Picker.Item label="LS-3" value={3}/>
		                        <Picker.Item label="LS-4" value={4}/>
		                        <Picker.Item label="LS-5" value={5}/>
		                    </Picker>
		                </View>
		        	</View>
					<View style={{flex:1,marginLeft:10}}>
		                <View style={this.styleUnderline(this.state.stageLmd,'picker', 'stageLmd')}>
		                    <Picker
		                        style={picker.style}
		                        selectedValue={this.state.stageLmd}
		                        onValueChange={(itemValue, itemIndex) => this.setState({stageLmd: itemValue}, this.changeLmdCalculationParameter(itemValue))}
		                    >
		                        <Picker.Item label="Select LMD stage" value={0}/>
		                        <Picker.Item label="CE-1" value={1}/>
		                        <Picker.Item label="CE-2" value={2}/>
		                        <Picker.Item label="CE-3" value={3}/>
		                        <Picker.Item label="CE-4" value={4}/>
		                        <Picker.Item label="CE-5" value={5}/>
		                    </Picker>
		                </View>
		        	</View>
	            </View>

				<View style={{width:'80%',flex:1,flexDirection:'row'}}>
					<View style={{flex:1,marginRight:10}}>
		                <View style={this.styleUnderline(this.state.currentElite,'picker', 'currentElite')}>
		                    <Picker
		                        style={picker.style}
		                        selectedValue={this.state.opCurrentElite}
		                        onValueChange={(itemValue, itemIndex) => this.setState({opCurrentElite: itemValue})}
		                    >
		                        <Picker.Item label="Current elite" value={-1}/>
		                        <Picker.Item label="E0" value={0}/>
		                        <Picker.Item label="E1" value={1}/>
		                        <Picker.Item label="E2" value={2}/>
		                    </Picker>
		                </View>
					</View>
					<View style={{flex:1,marginLeft:10}}>
						<View style={this.styleUnderline(this.state.opTargetedElite,'picker', 'targetedElite')}>
		                    <Picker
		                        style={picker.style}
		                        selectedValue={this.state.opTargetedElite}
		                        onValueChange={(itemValue, itemIndex) => this.setState({opTargetedElite: itemValue})}
		                    >
		                        <Picker.Item label="Targeted elite" value={-1}/>
		                        <Picker.Item label="E0" value={0}/>
		                        <Picker.Item label="E1" value={1}/>
		                        <Picker.Item label="E2" value={2}/>
		                    </Picker>
		                </View>
					</View>
				</View>
				<View style={{width:'80%',flex:1,flexDirection:'row'}}>
					<View style={{flex:1,marginRight:10}}>
		                <TextInput
		                    style={this.styleUnderline(parseInt(this.state.opCurrentLevel), 'textInput', 'currentLevel')}
		                    placeholder="Current Level"
		                    value={this.input}
		                    onChangeText={(input) => this.setState({opCurrentLevel: input})}
		                    keyboardType="numeric"
		                />
					</View>
					<View style={{flex:1,marginLeft:10}}>
						<TextInput
		                    style={this.styleUnderline(parseInt(this.state.opTargetedLevel), 'textInput', 'targetedLevel')}
		                    placeholder="Targeted Level"
		                    value={this.input}
		                    onChangeText={(input) => this.setState({opTargetedLevel: input})}
		                    keyboardType="numeric"
		                />
					</View>
				</View>
                <TouchableOpacity
                    onPress={() => this.calculateExp(parseInt(this.state.opRarity), parseInt(this.state.opCurrentElite), this.state.opCurrentLevel, parseInt(this.state.opTargetedElite), this.state.opTargetedLevel, parseInt(this.state.sanityUsedExp), parseInt(this.state.dropAmountExp), parseInt(this.state.sanityUsedLmd), parseInt(this.state.dropAmountLmd))}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Calculate</Text>
                </TouchableOpacity>
				{this.getResult()}
            </View>
        )
    }
}

export default ExpModule;

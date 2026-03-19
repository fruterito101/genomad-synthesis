// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant deltax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant deltay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant deltay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    
    uint256 constant IC0x = 3429018179400851554545987518503821258157359559153469166588846459030976306980;
    uint256 constant IC0y = 17963407454567352847541203498611136336118214011726910177186156537987561880602;
    
    uint256 constant IC1x = 16452867810052560116046842096202229596767360162254337511608652170064630195794;
    uint256 constant IC1y = 8895648129644253762416821665420444505014530040646159927857502397827262075399;
    
    uint256 constant IC2x = 406897427824387684092656881611731107912211581133193495307275425879774303156;
    uint256 constant IC2y = 10278291518409059011372558449315951216862964906306155757652915253928757157045;
    
    uint256 constant IC3x = 13363300147039421020855510744527228286084809476098186583908885885374396787999;
    uint256 constant IC3y = 3240612631849724988286359182789995083449966066769112893788523883657570128626;
    
    uint256 constant IC4x = 11701591891564772653015907068655864333825785799378978513841918268340174811593;
    uint256 constant IC4y = 4333839816068025255572923341509413025111386759968123138776252783288586231170;
    
    uint256 constant IC5x = 7264597388871117165752220176180291521156756682407598510965347182533435599187;
    uint256 constant IC5y = 11277764073985952584628560901241629255367760439207641091414137375013476234108;
    
    uint256 constant IC6x = 7547870532532093788812329814869545937519806636556564201718309188886611887751;
    uint256 constant IC6y = 15644112525758235100848578919119496572850241988128672205517862184549297865234;
    
    uint256 constant IC7x = 10897721498051958038642383312886696709858407795524127006817409242007308421988;
    uint256 constant IC7y = 6711553703614711674603680537916384970267700586863167433487074540896522431735;
    
    uint256 constant IC8x = 11693003336222561755824276885651120519694765329094788608884715679550272672888;
    uint256 constant IC8y = 1674770573682186973100037012994878744965982962306174423893493581227255873260;
    
    uint256 constant IC9x = 11151900663431238218307340608429355352985889815746030891000038842532309679696;
    uint256 constant IC9y = 18904506304317946571360065639081357157952242221479828353621981026143982807296;
    
    uint256 constant IC10x = 20163257722564816235843398412334944319261004785875136364119687939538120348260;
    uint256 constant IC10y = 2118808275503052833675681279917576008461953286613166069088085854985432667041;
    
    uint256 constant IC11x = 18398510784145693771682354140465928124891918236247574450121327982104348768070;
    uint256 constant IC11y = 13202365537280451953904038654290495444919236207023399079277416955632534684580;
    
    uint256 constant IC12x = 8063153170010051368263716852495108975504160052625844370704574057882676892203;
    uint256 constant IC12y = 7166444786827791034122224622127403169704659817243265482243849720839251252335;
    
    uint256 constant IC13x = 10307425493125491183887488126755875810528335346309191266633461376914357864598;
    uint256 constant IC13y = 11588875403752582611248210510135066774530029889791872469979688902103836912387;
    
    uint256 constant IC14x = 15553228871818232715672754108095204663182521254751733162904086760488488489073;
    uint256 constant IC14y = 12937693540207296234374326100737204853007170242988471016191287311687449373881;
    
    uint256 constant IC15x = 15121338385824429544925028191349265094325943789239022578055366001276755218278;
    uint256 constant IC15y = 21462278642537485332939105348215890844380698892989959612143719723089252911105;
    
    uint256 constant IC16x = 19615796035322398644797270253142192872872470225878701497305967503954328238214;
    uint256 constant IC16y = 10155144323446158166299442991642188835137921956546985373890156730211269365220;
    
    uint256 constant IC17x = 4753286138838460040763235991529128354718049247294399455890940813227276206750;
    uint256 constant IC17y = 945263175905964008566215570156790132762757208456077184940442907026088633976;
    
    uint256 constant IC18x = 6774036489851606233275092972912957747057804135952140131130594552066739379032;
    uint256 constant IC18y = 8311614547873121029006331528500906925646490557678657912133836882857475733945;
    
    uint256 constant IC19x = 11382337396744070627269555548946430750161167285672018029170021489497802198089;
    uint256 constant IC19y = 18794133187238332729523965860922522831529821278167010975373355862108762184670;
    
    uint256 constant IC20x = 12523211995574781705378852368394644582315876725582795967700786221907559425182;
    uint256 constant IC20y = 2268463783496626578713194927084328061721740100590739121294657764616529642212;
    
    uint256 constant IC21x = 1378235268277490278519476909590313389623551681275382605159279301064471281841;
    uint256 constant IC21y = 18177980069615188534069488509113119379620144009497557827857247736101619619595;
    
    uint256 constant IC22x = 8566456736570367773090997561211677370201468102712868251858868458665361341342;
    uint256 constant IC22y = 4747524021832470136636924489261719211050029520631339352683866541057899970191;
    
    uint256 constant IC23x = 15403480194722744624177862064840449664363769291534150658277574682865511645541;
    uint256 constant IC23y = 12056366908937380895384029298723842573162320859437854651626915022520942634487;
    
    uint256 constant IC24x = 12324863959946678848032462108112845770215271206017560082946825900300550583619;
    uint256 constant IC24y = 17349951539536324495916401302696709274098951551297881133110225870000460558280;
    
    uint256 constant IC25x = 10428414579949289841639664557790164387378149923134932551176410403544369220672;
    uint256 constant IC25y = 377335091979582242266485551367291851423866437678519410417192257987956258959;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[25] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                
                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))
                
                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))
                
                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))
                
                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))
                
                g1_mulAccC(_pVk, IC22x, IC22y, calldataload(add(pubSignals, 672)))
                
                g1_mulAccC(_pVk, IC23x, IC23y, calldataload(add(pubSignals, 704)))
                
                g1_mulAccC(_pVk, IC24x, IC24y, calldataload(add(pubSignals, 736)))
                
                g1_mulAccC(_pVk, IC25x, IC25y, calldataload(add(pubSignals, 768)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            
            checkField(calldataload(add(_pubSignals, 512)))
            
            checkField(calldataload(add(_pubSignals, 544)))
            
            checkField(calldataload(add(_pubSignals, 576)))
            
            checkField(calldataload(add(_pubSignals, 608)))
            
            checkField(calldataload(add(_pubSignals, 640)))
            
            checkField(calldataload(add(_pubSignals, 672)))
            
            checkField(calldataload(add(_pubSignals, 704)))
            
            checkField(calldataload(add(_pubSignals, 736)))
            
            checkField(calldataload(add(_pubSignals, 768)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }

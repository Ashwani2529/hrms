import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});

// Create Document Component
const MyDocument = ({ signatureUrl }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text>Section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
                <Image source={signatureUrl} />
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
                <Text>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis consectetur consequatur nostrum vel beatae aliquid
                    modi fugit distinctio incidunt architecto cumque explicabo aliquam molestias voluptatibus, accusamus, laudantium ex
                    repellendus eveniet est, eaque vero! Aperiam hic quisquam minima dolorum quod ipsam illum quasi exercitationem, rem sunt
                    expedita doloremque, odit quibusdam tenetur reiciendis repellat magnam quam officia, asperiores non nobis eaque nisi.
                    Nobis iusto minima vero et! Quae, sed. Voluptas dolores illum deserunt ducimus consequuntur fuga commodi, labore officia
                    accusamus nesciunt sequi. Fugit, quisquam sed, repellat molestias facere optio odio praesentium expedita consequatur
                    amet, dolor atque illum laborum. Vitae hic ullam ipsam.
                </Text>
            </View>
        </Page>
    </Document>
);

export default MyDocument;

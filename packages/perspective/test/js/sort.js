/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const data = {
    w: [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5],
    x: [1, 2, 3, 4, 4, 3, 2, 1],
    y: ["a", "b", "c", "d", "a", "b", "c", "d"],
    z: [true, false, true, false, true, false, true, false]
};

const data2 = {
    w: [3.5, 4.5, null, null, null, null, 1.5, 2.5],
    x: [1, 2, 3, 4, 4, 3, 2, 1],
    y: ["a", "b", "c", "d", "e", "f", "g", "h"]
};

const data3 = {
    w: [3.5, 4.5, null, null, null, null, 1.5, 2.5],
    x: [1, 2, 3, 4, 4, 3, 2, 1],
    y: ["a", "a", "a", "a", "b", "b", "b", "b"]
};

module.exports = perspective => {
    describe("Sorts", function() {
        describe("With nulls", () => {
            it("asc", async function() {
                var table = await perspective.table(data2);
                var view = await table.view({
                    columns: ["x", "w"],
                    sort: [["w", "asc"]]
                });

                const json = await view.to_columns();
                expect(json).toEqual({
                    w: [null, null, null, null, 1.5, 2.5, 3.5, 4.5],
                    x: [3, 4, 4, 3, 2, 1, 1, 2]
                });

                view.delete();
                table.delete();
            });

            it("desc", async function() {
                var table = await perspective.table(data2);
                var view = await table.view({
                    columns: ["x", "w"],
                    sort: [["w", "desc"]]
                });

                const json = await view.to_columns();
                expect(json).toEqual({
                    w: [4.5, 3.5, 2.5, 1.5, null, null, null, null],
                    x: [2, 1, 1, 2, 3, 4, 4, 3]
                });

                view.delete();
                table.delete();
            });

            it("asc datetime", async function() {
                var table = await perspective.table({
                    w: [new Date(2020, 0, 1, 12, 30, 45), new Date(2020, 0, 1), null, null, null, null, new Date(2008, 0, 1, 12, 30, 45), new Date(2020, 12, 1, 12, 30, 45)],
                    x: [1, 2, 3, 4, 4, 3, 2, 1],
                    y: ["a", "b", "c", "d", "e", "f", "g", "h"]
                });

                var view = await table.view({
                    columns: ["x", "w"],
                    sort: [["w", "asc"]]
                });

                const json = await view.to_columns();
                expect(json).toEqual({
                    w: [
                        null,
                        null,
                        null,
                        null,
                        new Date(2008, 0, 1, 12, 30, 45).getTime(),
                        new Date(2020, 0, 1).getTime(),
                        new Date(2020, 0, 1, 12, 30, 45).getTime(),
                        new Date(2020, 12, 1, 12, 30, 45).getTime()
                    ],
                    x: [3, 4, 4, 3, 2, 2, 1, 1]
                });

                view.delete();
                table.delete();
            });

            it("desc datetime", async function() {
                var table = await perspective.table({
                    w: [new Date(2020, 0, 1, 12, 30, 45), new Date(2020, 0, 1), null, null, null, null, new Date(2008, 0, 1, 12, 30, 45), new Date(2020, 12, 1, 12, 30, 45)],
                    x: [1, 2, 3, 4, 4, 3, 2, 1],
                    y: ["a", "b", "c", "d", "e", "f", "g", "h"]
                });

                var view = await table.view({
                    columns: ["x", "w"],
                    sort: [["w", "desc"]]
                });

                const json = await view.to_columns();
                expect(json).toEqual({
                    w: [
                        new Date(2020, 12, 1, 12, 30, 45).getTime(),
                        new Date(2020, 0, 1, 12, 30, 45).getTime(),
                        new Date(2020, 0, 1).getTime(),
                        new Date(2008, 0, 1, 12, 30, 45).getTime(),
                        null,
                        null,
                        null,
                        null
                    ],
                    x: [1, 1, 2, 2, 3, 4, 4, 3]
                });

                view.delete();
                table.delete();
            });
        });

        describe("With aggregates", function() {
            describe("aggregates, in a sorted column with nulls", function() {
                it("sum", async function() {
                    var table = await perspective.table(data2);
                    var view = await table.view({
                        columns: ["x", "w"],
                        row_pivots: ["y"],
                        aggregates: {
                            w: "sum",
                            x: "unique"
                        },
                        sort: [["w", "asc"]]
                    });

                    const json = await view.to_columns();
                    expect(json).toEqual({
                        __ROW_PATH__: [[], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["a"], ["b"]],
                        w: [12, 0, 0, 0, 0, 1.5, 2.5, 3.5, 4.5],
                        x: [null, 3, 4, 4, 3, 2, 1, 1, 2]
                    });

                    view.delete();
                    table.delete();
                });

                it("sum of floats", async function() {
                    var table = await perspective.table({
                        w: [3.25, 4.51, null, null, null, null, 1.57, 2.59],
                        x: [1, 2, 3, 4, 4, 3, 2, 1],
                        y: ["a", "b", "c", "d", "e", "f", "g", "h"]
                    });
                    var view = await table.view({
                        columns: ["x", "w"],
                        row_pivots: ["y"],
                        aggregates: {
                            w: "sum",
                            x: "unique"
                        },
                        sort: [["w", "asc"]]
                    });

                    const json = await view.to_columns();
                    expect(json).toEqual({
                        __ROW_PATH__: [[], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["a"], ["b"]],
                        w: [11.92, 0, 0, 0, 0, 1.57, 2.59, 3.25, 4.51],
                        x: [null, 3, 4, 4, 3, 2, 1, 1, 2]
                    });

                    view.delete();
                    table.delete();
                });

                it("unique", async function() {
                    var table = await perspective.table(data2);
                    var view = await table.view({
                        columns: ["x", "w"],
                        row_pivots: ["y"],
                        aggregates: {
                            w: "unique",
                            x: "unique"
                        },
                        sort: [["w", "asc"]]
                    });

                    const json = await view.to_columns();
                    expect(json).toEqual({
                        __ROW_PATH__: [[], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["a"], ["b"]],
                        w: [null, null, null, null, null, 1.5, 2.5, 3.5, 4.5],
                        x: [null, 3, 4, 4, 3, 2, 1, 1, 2]
                    });

                    view.delete();
                    table.delete();
                });

                it("avg", async function() {
                    var table = await perspective.table(data2);
                    var view = await table.view({
                        columns: ["x", "w"],
                        row_pivots: ["y"],
                        aggregates: {
                            w: "avg",
                            x: "unique"
                        },
                        sort: [["w", "asc"]]
                    });

                    const json = await view.to_columns();
                    expect(json).toEqual({
                        __ROW_PATH__: [[], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["a"], ["b"]],
                        w: [3, null, null, null, null, 1.5, 2.5, 3.5, 4.5],
                        x: [null, 3, 4, 4, 3, 2, 1, 1, 2]
                    });

                    // Broken result:
                    // {
                    //     __ROW_PATH__: [[], ["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"]],
                    //     w: [3, 3.5, 4.5, null, null, null, null, 1.5, 2.5],
                    //     x: [null, 1, 2, 3, 4, 4, 3, 2, 1]
                    // };

                    view.delete();
                    table.delete();
                });

                describe("Multiple hidden sort", () => {
                    it("sum", async function() {
                        var table = await perspective.table(data3);
                        var view = await table.view({
                            columns: ["x", "w"],
                            row_pivots: ["y"],
                            aggregates: {
                                w: "sum"
                            },
                            sort: [
                                ["x", "desc"],
                                ["w", "desc"]
                            ]
                        });

                        const json = await view.to_columns();
                        expect(json).toEqual({
                            __ROW_PATH__: [[], ["a"], ["b"]],
                            w: [12, 8, 4],
                            x: [20, 10, 10]
                        });

                        view.delete();
                        table.delete();
                    });

                    it("sum of floats", async function() {
                        var table = await perspective.table({
                            w: [3.25, 4.51, null, null, null, null, 1.57, 2.59],
                            x: [1, 2, 3, 4, 4, 3, 2, 1],
                            y: ["a", "a", "a", "a", "b", "b", "b", "b"]
                        });
                        var view = await table.view({
                            columns: ["x", "w"],
                            row_pivots: ["y"],
                            aggregates: {
                                w: "sum"
                            },
                            sort: [
                                ["x", "desc"],
                                ["w", "desc"]
                            ]
                        });

                        const json = await view.to_columns();
                        expect(json).toEqual({
                            __ROW_PATH__: [[], ["a"], ["b"]],
                            w: [11.92, 7.76, 4.16],
                            x: [20, 10, 10]
                        });

                        view.delete();
                        table.delete();
                    });

                    it("unique", async function() {
                        var table = await perspective.table(data3);
                        var view = await table.view({
                            columns: ["x", "w"],
                            row_pivots: ["y"],
                            aggregates: {
                                w: "unique"
                            },
                            sort: [
                                ["x", "desc"],
                                ["w", "desc"]
                            ]
                        });

                        const json = await view.to_columns();
                        expect(json).toEqual({
                            __ROW_PATH__: [[], ["a"], ["b"]],
                            w: [null, null, null],
                            x: [20, 10, 10]
                        });

                        view.delete();
                        table.delete();
                    });

                    it("avg", async function() {
                        var table = await perspective.table(data3);
                        var view = await table.view({
                            columns: ["x", "w"],
                            row_pivots: ["y"],
                            aggregates: {
                                w: "avg"
                            },
                            sort: [
                                ["x", "desc"],
                                ["w", "desc"]
                            ]
                        });

                        const json = await view.to_columns();
                        expect(json).toEqual({
                            __ROW_PATH__: [[], ["a"], ["b"]],
                            // 4 and 2 are the avg of the non-null rows
                            w: [3, 4, 2],
                            x: [20, 10, 10]
                        });

                        view.delete();
                        table.delete();
                    });
                });
            });
        });

        describe("On hidden columns", function() {
            it("Column path should not emit hidden sorts", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w", "y"],
                    sort: [["x", "desc"]]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["w", "y"]);
                view.delete();
                table.delete();
            });

            it("Column path should not emit hidden column sorts", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w"],
                    row_pivots: ["y"],
                    column_pivots: ["z"],
                    sort: [["x", "col desc"]]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["__ROW_PATH__", "false|w", "true|w"]);
                view.delete();
                table.delete();
            });

            it("Column path should not emit hidden regular and column sorts", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w"],
                    row_pivots: ["y"],
                    column_pivots: ["z"],
                    sort: [
                        ["x", "col desc"],
                        ["y", "desc"]
                    ]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["__ROW_PATH__", "false|w", "true|w"]);
                view.delete();
                table.delete();
            });

            it("unpivoted", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w", "y"],
                    sort: [["x", "desc"]]
                });
                var answer = [
                    {w: 4.5, y: "d"},
                    {w: 5.5, y: "a"},
                    {w: 3.5, y: "c"},
                    {w: 6.5, y: "b"},
                    {w: 2.5, y: "b"},
                    {w: 7.5, y: "c"},
                    {w: 1.5, y: "a"},
                    {w: 8.5, y: "d"}
                ];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("row pivot ['y']", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w"],
                    row_pivots: ["y"],
                    sort: [["x", "desc"]]
                });
                var answer = [
                    {__ROW_PATH__: [], w: 40},
                    {__ROW_PATH__: ["a"], w: 7},
                    {__ROW_PATH__: ["b"], w: 9},
                    {__ROW_PATH__: ["c"], w: 11},
                    {__ROW_PATH__: ["d"], w: 13}
                ];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("row pivot and hidden sort ['y'] with aggregates specified", async function() {
                const table = await perspective.table({
                    x: [1, 2, 3, 4, 5],
                    y: ["a", "b", "b", "b", "c"]
                });
                // Aggregate should be overriden if the sort column is hidden
                // AND also in row pivots
                const view = await table.view({
                    aggregates: {
                        x: "sum",
                        y: "count"
                    },
                    columns: ["x"],
                    row_pivots: ["y"],
                    sort: [["y", "desc"]]
                });
                const answer = [
                    {__ROW_PATH__: [], x: 15},
                    {__ROW_PATH__: ["c"], x: 5},
                    {__ROW_PATH__: ["b"], x: 9},
                    {__ROW_PATH__: ["a"], x: 1}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("row pivot and hidden sort ['y'] without aggregates specified", async function() {
                const table = await perspective.table({
                    x: [1, 2, 3, 4, 5],
                    y: ["a", "b", "b", "b", "c"]
                });
                const view = await table.view({
                    columns: ["x"],
                    row_pivots: ["y"],
                    sort: [["y", "desc"]]
                });
                const answer = [
                    {__ROW_PATH__: [], x: 15},
                    {__ROW_PATH__: ["c"], x: 5},
                    {__ROW_PATH__: ["b"], x: 9},
                    {__ROW_PATH__: ["a"], x: 1}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("column pivot ['y']", async function() {
                const table = await perspective.table(data);
                const view = await table.view({
                    columns: ["w"],
                    column_pivots: ["y"],
                    sort: [["x", "desc"]]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["a|w", "b|w", "c|w", "d|w"]);
                const answer = [
                    {"a|w": null, "b|w": null, "c|w": null, "d|w": 4.5},
                    {"a|w": 5.5, "b|w": null, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": 3.5, "d|w": null},
                    {"a|w": null, "b|w": 6.5, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": 2.5, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": 7.5, "d|w": null},
                    {"a|w": 1.5, "b|w": null, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": null, "d|w": 8.5}
                ];
                const result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("column pivot ['y'], col desc sort", async function() {
                const table = await perspective.table(data);
                const view = await table.view({
                    columns: ["w"],
                    column_pivots: ["y"],
                    sort: [["x", "col desc"]]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["d|w", "c|w", "b|w", "a|w"]);
                const answer = {
                    "d|w": [null, null, null, 4.5, null, null, null, 8.5],
                    "c|w": [null, null, 3.5, null, null, null, 7.5, null],
                    "b|w": [null, 2.5, null, null, null, 6.5, null, null],
                    "a|w": [1.5, null, null, null, 5.5, null, null, null]
                };
                const result = await view.to_columns();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("column pivot and hidden sort ['y']", async function() {
                const table = await perspective.table({
                    x: [1, 2, 3, 4],
                    y: ["a", "a", "a", "b"]
                });
                const view = await table.view({
                    columns: ["x"],
                    column_pivots: ["y"],
                    sort: [["y", "desc"]]
                });

                const paths = await view.column_paths();
                // regular non-col sort should not change order of column paths
                expect(paths).toEqual(["a|x", "b|x"]);

                const result = await view.to_columns();
                expect(result).toEqual({
                    "a|x": [null, 1, 2, 3],
                    "b|x": [4, null, null, null]
                });
                view.delete();
                table.delete();
            });

            it("column pivot and hidden col sort ['y']", async function() {
                const table = await perspective.table({
                    x: [1, 2, 3, 4],
                    y: ["a", "a", "a", "b"]
                });
                const view = await table.view({
                    columns: ["x"],
                    column_pivots: ["y"],
                    sort: [["y", "col desc"]]
                });

                const paths = await view.column_paths();
                expect(paths).toEqual(["b|x", "a|x"]);

                const result = await view.to_columns();
                expect(result).toEqual({
                    "b|x": [null, null, null, 4],
                    "a|x": [1, 2, 3, null]
                });
                view.delete();
                table.delete();
            });

            it("column pivot ['y'] with overridden aggregates", async function() {
                const table = await perspective.table({
                    x: [1, 2, 3, 4],
                    y: ["a", "a", "a", "b"]
                });
                const view = await table.view({
                    columns: ["x"],
                    column_pivots: ["y"],
                    aggregates: {y: "count"},
                    sort: [["y", "col desc"]]
                });

                const paths = await view.column_paths();
                // Col sort will override aggregate
                expect(paths).toEqual(["b|x", "a|x"]);

                let result = await view.to_columns();
                expect(result).toEqual({
                    "b|x": [null, null, null, 4],
                    "a|x": [1, 2, 3, null]
                });

                view.delete();
                table.delete();
            });

            it("column pivot ['y'] with extra aggregates", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w"],
                    column_pivots: ["y"],
                    aggregates: {w: "sum", z: "last"},
                    sort: [["x", "desc"]]
                });
                var answer = [
                    {"a|w": null, "b|w": null, "c|w": null, "d|w": 4.5},
                    {"a|w": 5.5, "b|w": null, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": 3.5, "d|w": null},
                    {"a|w": null, "b|w": 6.5, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": 2.5, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": 7.5, "d|w": null},
                    {"a|w": 1.5, "b|w": null, "c|w": null, "d|w": null},
                    {"a|w": null, "b|w": null, "c|w": null, "d|w": 8.5}
                ];
                let result = await view.to_json();
                expect(result).toEqual(answer);
                view.delete();
                table.delete();
            });

            it("row pivot ['x'], column pivot ['y'], both hidden and asc sorted", async function() {
                const table = await perspective.table({
                    x: ["a", "a", "b", "c"],
                    y: ["x", "x", "y", "x"],
                    z: [1, 2, 3, 4]
                });
                const view = await table.view({
                    columns: ["z"],
                    row_pivots: ["x"],
                    column_pivots: ["y"],
                    sort: [
                        ["x", "asc"],
                        ["y", "col asc"]
                    ]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["__ROW_PATH__", "x|z", "y|z"]);
                const expected = {__ROW_PATH__: [[], ["a"], ["b"], ["c"]], "x|z": [7, 3, null, 4], "y|z": [3, null, 3, null]};
                const result = await view.to_columns();
                expect(result).toEqual(expected);
                view.delete();
                table.delete();
            });

            it("row pivot ['x'], column pivot ['y'], both hidden and desc sorted", async function() {
                const table = await perspective.table({
                    x: ["a", "a", "b", "c"],
                    y: ["x", "x", "y", "x"],
                    z: [1, 2, 3, 4]
                });
                const view = await table.view({
                    columns: ["z"],
                    row_pivots: ["x"],
                    column_pivots: ["y"],
                    sort: [
                        ["x", "desc"],
                        ["y", "col desc"]
                    ]
                });
                const paths = await view.column_paths();
                expect(paths).toEqual(["__ROW_PATH__", "y|z", "x|z"]);
                const expected = {__ROW_PATH__: [[], ["c"], ["b"], ["a"]], "y|z": [3, null, 3, null], "x|z": [7, 4, null, 3]};
                const result = await view.to_columns();
                expect(result).toEqual(expected);
                view.delete();
                table.delete();
            });

            it("column pivot ['y'] has correct # of columns", async function() {
                var table = await perspective.table(data);
                var view = await table.view({
                    columns: ["w"],
                    column_pivots: ["y"],
                    sort: [["x", "desc"]]
                });
                let result = await view.num_columns();
                expect(result).toEqual(4);
                view.delete();
                table.delete();
            });
        });
    });
};
